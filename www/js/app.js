// When building for IOS
// http://stackoverflow.com/questions/10714600/cdvplugin-h-file-not-found-in-cordova-as-component-cleaver
// http://forum.ionicframework.com/t/cordova-cdvviewcontroller-h-file-not-found-in-xcode-7-1-beta/32232/3
// Aslo remember to set device to iOS and require full screen

// handle the deep link
// src: https://medium.com/angularjs-articles/deep-linking-in-ionic-mobile-applications-44d8b4685bb3#.1mcs22njc
if ('cordova' in window) {
  // Create a sticky event for handling the app being opened via a custom URL
  console.log("[global] Added a sticky event handler");
  cordova.addStickyDocumentEventHandler('handleopenurl');
}

function handleOpenURL (url) {
  console.log("[global] Handle Open URL is called: " + url)
  cordova.fireDocumentEvent('handleopenurl', { url: url });
};


angular.module('yadl', ['ionic', 'ui.router', 'ngCordova', 'LocalStorageModule', 'ngProgress', 'imageSpinner'])

.constant('VERSION', '2.3.0')
.constant('YADL', 'yadl-client')
.constant('YADL_IMAGES_URL', 'http://yadl.image.bucket.s3-website-us-east-1.amazonaws.com')
.constant('OHMAGE_DATA_URL', 'https://ohmage-omh.smalldata.io')

.run( function( $rootScope, $state, $stateParams, $ionicPlatform, $cordovaStatusbar, $cordovaLocalNotification, OpenUrlService ) {
  console.log("[run] In the .run()")
  if (OpenUrlService) {
    console.log("[run] OpenURL Service!");
    document.addEventListener('handleopenurl', OpenUrlService.handleOpenUrl, false);
    document.addEventListener('resume', OpenUrlService.onResume, false);
  }

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

    // schedule notification 
    if( window.cordova && window.cordova.plugins.notification ){
      
      $cordovaLocalNotification.cancelAll();
      
      $cordovaLocalNotification.schedule({
        id: 1,
        text: "Time to do your monthly YADL survey.",
        every: "month"
      });
      
      $cordovaLocalNotification.schedule({
        id: 2,
        text: "Time to do your daily YADL survey.",
        every: "day"
      });
      
      // cordova.plugins.notification.local.on("trigger", function(notification) {
      //   // var args = JSON.parse(arguments);
      //   alert(notification.id)
      //   // $state.go(args.data.state);
      // });
      
      cordova.plugins.notification.local.on("click", function(notification) {
        if(notification.id == 1){
          $state.go('monthly');
        }else{
          $state.go('daily');
        }
      });
      
    }
  });
})

.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('yadl');
})

.config( function( $stateProvider, $urlRouterProvider ) {
  $stateProvider
    .state('auth', {
      url: '/auth',
      templateUrl: 'js/accounts/views/auth.tmpl.html',
      controller: 'AuthController',
      controllerAs: 'auth'
    })
    .state('daily', {
      url: '/daily',
      templateUrl: 'js/daily/views/daily.tmpl.html',
      controller: 'DailyController',
      controllerAs: 'daily'
    })
    .state('monthly', {
      url: '/monthly',
      templateUrl: 'js/monthly/views/monthly.tmpl.html',
      controller: 'MonthlyController',
      controllerAs: 'monthly'
    })
    .state('activities',{
      url: '/activities',
      templateUrl: 'js/activities/views/activities.tmpl.html',
      controller: 'ActivitiesController',
      controllerAs: 'activities'
    })
    .state('settings',{
      url: '/settings',
      templateUrl: 'js/accounts/views/settings.tmpl.html',
      controller: 'SettingsController',
      controllerAs: 'settings'
    })
    .state('thankyou', {
      url: '/thankyou',
      templateUrl: 'js/thankyou.tmpl.html',
    });
  
  $urlRouterProvider.otherwise('/auth');
})

.factory('OpenUrlService', ['$log', '$location', '$rootScope', '$ionicHistory', '$state', 
  function ($log, $location, $rootScope, $ionicHistory, $state) {

    var openUrl = function (url) {

      console.log('[OpenUrlService]: Handling open URL ' + url);

      // Stop it from caching the first view as one to return when the app opens
      $ionicHistory.nextViewOptions({
        historyRoot: true,
        disableBack: true,
        disableAnimation: true
      });

      if (url) {
        console.log('[OpenUrlService]: In the If')
        window.location.hash = url.substr(5);
        $rootScope.$broadcast('handleopenurl', url);

        window.cordova.removeDocumentEventHandler('handleopenurl');
        window.cordova.addStickyDocumentEventHandler('handleopenurl');
        document.removeEventListener('handleopenurl', handleOpenUrl);
        
        $state.go(url = url.split('://')[1]);
      }
    };

    var handleOpenUrl = function (e) {
      openUrl(e.url);
    };
    
    var onResume = function () {
      document.addEventListener('handleopenurl', handleOpenUrl, false);
    };

    return {
      handleOpenUrl: handleOpenUrl,
      onResume: onResume
    };

}])

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
      removeToken: removeToken,
      checkAuth: checkAuth
    };
}])

.factory('ActivitiesFactory', ['$q', '$http', '$state', 'localStorageService', 'AuthFactory', 
  'YADL_IMAGES_URL', 'OHMAGE_DATA_URL',
  function($q, $http, $state, localStorageService, AuthFactory, YADL_IMAGES_URL, OHMAGE_DATA_URL){

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
    
    function cacheActivities( activities ){
      return localStorageService.set( 'activities', activities );
    }
    
    function getCachedActivities( ){
      var deferred = $q.defer();
      deferred.resolve( localStorageService.get('activities') );
      return deferred.promise;
    }

    function removeCachedActivities( ){
      return localStorageService.remove('activities')
    }

    function updateStreamList( data ){
      data.forEach(function(obj){
        streamList.push( 
          {
            'activity_image': 'data/' + obj.file,
            'activity_name': obj.title,
            'activity_intensity': null,
            'activity_image_index': -1
          }
        );
      })
    }

    function getMetaFile( ){
      var deferred = $q.defer();

      // $http({ url: YADL_IMAGES_URL + '/meta.json',
      //       method: 'GET',
      //       contentType: 'application/json'
      //     })
      $http.get('data/config.json')
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

    function postMonthlyActivities( activities ){
      var deferred = $q.defer();
      
      // we cache the HARD
      var hardActivities = [];
      for(var i =0; i<activities.length; i++){
        if( activities[i].activity_intensity == "HARD" ){
          hardActivities.push(activities[i]);
        }
      }
      
      // if no HARD activities we cache the MODERATE
      if(hardActivities.length == 0){
        for(var i =0; i<activities.length; i++){
          if( activities[i].activity_intensity == "MODERATE" ){
            hardActivities.push(activities[i]);
          }
        } 
      }
      cacheActivities( hardActivities );
      // we post the monthly results to ohmage service      
      var ohmagePackage = {
                            "header": {
                              "id": guid(),
                              "creation_date_time": new Date(),
                              "schema_id": {
                                "namespace": "omh",
                                "name": "yadl-monthly-survey",
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
          AuthFactory.removeToken();
          $state.go('auth');
        });

      return deferred.promise;
    }
    
    function postDailyActivities( activities ){
      var deferred = $q.defer();
      // we post the daily results to ohmage service      
      var ohmagePackage = {
                            "header": {
                              "id": guid(),
                              "creation_date_time": new Date(),
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
          AuthFactory.removeToken();
          $state.go('auth');
        });

      return deferred.promise;
    }
    
    return{
      cacheActivities: cacheActivities,
      getCachedActivities: getCachedActivities,
      removeCachedActivities: removeCachedActivities,
      getActivities: getActivities,
      postMonthlyActivities: postMonthlyActivities,
      postDailyActivities: postDailyActivities
    };
}])

.controller('AuthController', ['$rootScope', '$window', '$state',
  '$ionicPlatform', '$cordovaInAppBrowser', 'AuthFactory', 'ActivitiesFactory', 'YADL',
  'OHMAGE_DATA_URL',
  function($rootScope, $window, $state, $ionicPlatform, 
    $cordovaInAppBrowser, AuthFactory, ActivitiesFactory, YADL, OHMAGE_DATA_URL){
  
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
        $state.go( 'daily' );
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
        // on fresh auth clean the cache
        ActivitiesFactory.removeCachedActivities();
        $cordovaInAppBrowser.close();
      }

    });

    $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){
      $state.go( 'monthly' );
    });
}])

.controller('MonthlyController', ['$state', 'AuthFactory', 'ActivitiesFactory', 'ngProgressFactory',
  function($state, AuthFactory, ActivitiesFactory, ngProgressFactory){
    var vm = this;
    vm.list = [];
    vm.indx = 0;
    
    function submitResponses( ){
      // submit responses
      ActivitiesFactory.postMonthlyActivities( vm.list )
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
    
    var back = function( ){
      if( vm.indx > 0 ){
        vm.indx -= 1;
      }
    };
    vm.back = back;

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
      // AuthFactory.checkAuth( );

      ActivitiesFactory.getActivities( )
        .then(function(list){
          vm.list = list;
          console.log(list)
        })
        .catch(function(err){
          alert("Sorry, there was an error.");
        });
    } init( );
}])

.controller('DailyController', ['$log', '$state', 'AuthFactory', 'ActivitiesFactory', 
  function($log, $state, AuthFactory, ActivitiesFactory){
    var vm = this;
    vm.list = [];
    vm.selectedActivities = [];

    vm.confirmSelection = false;

    var isActivitySelected = function(activity){
      for(var i=0; i<vm.selectedActivities.length; i++){
        if(activity.activity_name == vm.selectedActivities[i].activity_name){
          return true;
        }
      }
      return false;
    };
    vm.isActivitySelected = isActivitySelected;

    var selectActivity = function(activity){
      activity.selected = !activity.selected;
      if( isActivitySelected(activity) ){
        var indx = -1;
        for(var i=0; i<vm.selectedActivities.length; i++){
          if(activity.activity_name == vm.selectedActivities[i].activity_name){
            indx = i;
          }
        }
        vm.selectedActivities.splice( indx, 1 );
      }else{
        vm.selectedActivities.push(activity);  
      }
    };
    vm.selectActivity = selectActivity;

    var submitSelection = function( ){
      
      ActivitiesFactory.postDailyActivities( vm.list )
        .then(function(res){
          $state.go( 'thankyou' );
        })
        .catch(function(err){
          alert('Sorry, there was an error please log out and log in.');
        });
      vm.confirmSelection = true;
      
    };
    vm.submitSelection = submitSelection;
    
    function init( ){

      // AuthFactory.checkAuth( );

      ActivitiesFactory.getCachedActivities( )
        .then(function(list){
          for(var i =0; i<list.length; i++){
            list[i].selected = false;
          }
          vm.list = list; 
        })
        .catch(function(err){
          alert("Sorry, there was an error.");
          $log.error(err);
        });

    } init( );
}])

.controller('ActivitiesController', ['$scope', '$state', '$ionicModal', 'AuthFactory', 'ActivitiesFactory', 'VERSION', 
  function($scope, $state, $ionicModal, AuthFactory, ActivitiesFactory, VERSION){
    var vm = this;
    vm.list = [];
    vm.selectedActivities = [];
    vm.confirmSelection = false;
    
    $scope.version = VERSION;
    
    var isActivitySelected = function(activity){
      for(var i=0; i<vm.selectedActivities.length; i++){
        if(activity.activity_name == vm.selectedActivities[i].activity_name){
          return true;
        }
      }
      return false;
    };
    vm.isActivitySelected = isActivitySelected;

    var selectActivity = function(activity){
      if( isActivitySelected(activity) ){
        var indx = -1;
        for(var i=0; i<vm.selectedActivities.length; i++){
          if(activity.activity_name == vm.selectedActivities[i].activity_name){
            indx = i;
          }
        }
        vm.selectedActivities.splice( indx, 1 );
      }else{
        vm.selectedActivities.push(activity);  
      }
    };
    vm.selectActivity = selectActivity;

    var submitSelection = function( ){
      ActivitiesFactory.cacheActivities( vm.selectedActivities )
      $state.go('daily');
    };
    vm.submitSelection = submitSelection;
    
   
    function init( ){
      AuthFactory.checkAuth( );

      ActivitiesFactory.getActivities( )
        .then(function(list){
          vm.list = list;
        })
        .catch(function(err){
          alert("Sorry, there was an error");
        });

      ActivitiesFactory.getCachedActivities( )
        .then(function(list){
          vm.selectedActivities = list; 
        })
        .catch(function(err){
          alert("Sorry, there was an error.");
        });
    } init( );
}])

.controller('SettingsController', ['$state', '$window', 'AuthFactory', 'VERSION', 
  function($state, $window, AuthFactory, VERSION){
    var vm = this;
    vm.version = VERSION;
    
    vm.notificationConfig = { evening: true }
  
    var goBack = function(){
       $window.history.back();
    };
    vm.goBack = goBack;
    
    var signout = function( ){
      AuthFactory.removeToken();
      $state.go('auth');
    };
    vm.signout = signout;
  
}]);
