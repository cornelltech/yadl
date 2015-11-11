angular.module('yadl', ['ionic', 'ui.router', 'ngCordova', 'LocalStorageModule'])

.constant('YADL', 'yadl-client')
.constant('YADL_SECRET', 'fW5hpgbBKcjYvV3yULJQekxpB2FBZscANfHxwy58VLUHq45mt6AC92ruR5ZMugmusAWSke2xUJW84Y7j2DQvMYxNnyPxpmsun')
.constant('YADL_IMAGES_URL', 'http://yadl.image.bucket.s3-website-us-east-1.amazonaws.com')
.constant('OHMAGE_DATA_URL', 'https://ohmage-omh.smalldata.io')

.run( function( $rootScope, $state, $ionicPlatform, $cordovaStatusbar ) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // make the status bar white
      $cordovaStatusbar.style(1);
    }
  });
})

.config( function( $stateProvider, $urlRouterProvider ) {
  $stateProvider
    .state('auth', {
      url: '/auth',
      templateUrl: 'js/accounts/views/auth.tmpl.html',
      controller: 'AuthController',
      controllerAs: 'auth'
    })
    .state('config', {
      url: '/config',
      templateUrl: 'js/config/views/config.tmpl.html',
      controller: 'ConfigController',
      controllerAs: 'config'
    })
    .state('activities', {
      url: '/activities',
      templateUrl: 'js/activities/views/activities.tmpl.html',
      controller: 'ActivitiesController',
      controllerAs: 'activities'
    })
    .state('thankyou', {
      url: '/thankyou',
      templateUrl: 'js/activities/views/thankyou.tmpl.html',
    });
  
  $urlRouterProvider.otherwise('/auth');
})

.factory('AuthFactory', ['$state', 'localStorageService', 
  function($state, localStorageService){
  
    function setToken( token ){
      return localStorageService.set( 'ohmage_token', token );
    }

    function getToken( ){
      return localStorageService.get( 'ohmage_token' ); 
    }

    function removeToken( ){
      return localStorageService.remove( 'ohmage_token' );
    }

    function checkAuth( ){
      if( getToken( ) ){
        return getToken( );
      }else{
        $state.go('auth');
      }
    }

    return{
      setToken: setToken,
      checkAuth: checkAuth
    };
}])

.factory('ActivitiesFactory', ['$q', '$http', 'localStorageService', 'AuthFactory', 
  'YADL_IMAGES_URL', 'OHMAGE_DATA_URL',
  function($q, $http, localStorageService, AuthFactory, YADL_IMAGES_URL, OHMAGE_DATA_URL){

    var streamList = [];

    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    function updateStreamList( data ){
      data.fileNames.forEach(function(obj){
        streamList.push( 
          {
            'activity_image': YADL_IMAGES_URL + '/' + obj + '.' + data.fileType,
            'activity_name': obj,
            'activity_intensity': null,
            'activity_image_index': -1
          }
        );
      })
    }

    function getMetaFile( ){
      var deferred = $q.defer();

      $http({ url: YADL_IMAGES_URL + '/meta.json',
            method: 'GET',
            contentType: 'application/json'
          })
      .then(function( res ){
        updateStreamList( res.data );
        deferred.resolve( );
      })
      .catch(function( err ){
        deferred.reject( err );
      });

      return deferred.promise;
    }

    function getActivities( ){
      var deferred = $q.defer();
      streamList = []
      getMetaFile()
        .then(function(){
          deferred.resolve(streamList);
        })
        .catch(function(err){
          deferred.reject( err );
        })

      return deferred.promise;
    }

    function postActivities( activities ){
      var deferred = $q.defer();
      var ohmagePackage = {
                            "header": {
                              "id": guid(),
                              "creation_date_time": Date.now(),
                              "schema_id": {
                                "namespace": "omh",
                                "name": "yadl-daily-survey",
                                "version": "1.0"
                              },
                              "acquisition_provenance": {
                                "source_name": "YADL",
                                "modality": "self-reported"
                              }
                            },
                            "body": {
                              "activities": activities
                            }
                          };
      $http({ url: OHMAGE_DATA_URL + '/dsu/dataPoints',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Authorization': 'Bearer ' + AuthFactory.checkAuth( ) },
            data: ohmagePackage
          })
        .then(function( res ){
          deferred.resolve( res.data );
        })
        .catch(function( err ){
          deferred.reject( err );
        });

      return deferred.promise;
    }

    function pickActivities( ){

    }

    return{
      getActivities: getActivities,
      postActivities: postActivities
    };
}])

.controller('AuthController', ['$rootScope', '$window', '$state',
  '$ionicPlatform', '$cordovaInAppBrowser', 'AuthFactory', 'YADL',
  'OHMAGE_DATA_URL',
  function($rootScope, $window, $state, $ionicPlatform, 
    $cordovaInAppBrowser, AuthFactory, YADL, OHMAGE_DATA_URL){
  
    var vm = this;

    var ohmageStrategy = function( ){
      var ohmageUrl = OHMAGE_DATA_URL + '/dsu/oauth/authorize?client_id=' + YADL + '&response_type=token';
      $ionicPlatform.ready(function() {
        $cordovaInAppBrowser.open(ohmageUrl, '_blank', { 
                                                        location: 'yes',
                                                        clearcache: 'no',
                                                        clearsessioncache: 'no',
                                                        toolbar: 'no',
                                                        toolbarposition: 'bottom'
                                                       });
      });
    };
    vm.ohmageStrategy = ohmageStrategy;

    function init( ){
      if( AuthFactory.checkAuth( )){
        $state.go( 'activities' );
      }
    } init( );

    // Listen to in-app browser events to monitor URL for 
    // succesfull oauth completion
    $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
      var url = event.url.split('#')
      if( url.length > 1 && url[0].indexOf('lumbr.cornelltech.io') > -1){
        var params = url[1].substr(1).split('&')
        var accessToken = params[0].split('=')[1];
        AuthFactory.setToken( accessToken );
        $cordovaInAppBrowser.close();
      }

    });

    $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){
      $state.go('activities');
    });
}])

.controller('ConfigController', ['$state', 'AuthFactory', 'ActivitiesFactory', 
  function($state, AuthFactory, ActivitiesFactory){
    var vm = this;
    vm.list = [];
    var selectedActivities = [];

    var isActivitySelected = function(activity){
      for(var i=0; i<selectedActivities.length; i++){
        if(activity.activity_name == selectedActivities[i].activity_name){
          return true;
        }
      }
      return false;
    };
    vm.isActivitySelected = isActivitySelected;

    var selectActivity = function(activity){
      if( isActivitySelected(activity) ){
        selectedActivities.splice( selectedActivities.indexOf(activity), 1 );
      }else{
        selectedActivities.push(activity);  
      }
      console.log(selectedActivities)
    };
    vm.selectActivity = selectActivity;
    
    function init( ){
      AuthFactory.checkAuth( )

      ActivitiesFactory.getActivities( )
        .then(function(list){
          vm.list = list;
          console.log(list)
        })
    } init( );
}])

.controller('ActivitiesController', ['$state', 'AuthFactory', 'ActivitiesFactory', 
  function($state, AuthFactory, ActivitiesFactory){
    var vm = this;
    vm.list = [];
    vm.indx = 0;

    function submitResponses( ){
      // submit responses
      ActivitiesFactory.postActivities( vm.list )
        .then(function( res ){
          $state.go('thankyou');    
        })
        .catch(function( err ){
          alert("There was an error!");
        });
    }

    var skip = function( ){
      if( vm.indx < vm.list.length - 1 ){
        vm.indx += 1;   
      }else{
        submitResponses( )
      }
    };
    vm.skip = skip;

    var makeResponse = function( response ){

      vm.list[vm.indx]['activity_intensity'] = response;
      vm.list[vm.indx]['activity_image_index'] = vm.indx;
      
      if( vm.indx < vm.list.length - 1 ){
        vm.indx += 1;   
      }else{
        submitResponses( )
      }
    };
    vm.makeResponse = makeResponse;

    function init( ){
      AuthFactory.checkAuth( )

      ActivitiesFactory.getActivities( )
        .then(function(list){
          vm.list = list;
        })
    } init( );
}])