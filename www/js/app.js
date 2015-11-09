angular.module('yadl', ['ionic', 'ui.router', 'ngCordova', 'LocalStorageModule'])

.constant('YADL', 'yadl-client')
.constant('YADL_SECRET', 'fW5hpgbBKcjYvV3yULJQekxpB2FBZscANfHxwy58VLUHq45mt6AC92ruR5ZMugmusAWSke2xUJW84Y7j2DQvMYxNnyPxpmsun')
.constant('YADL_IMAGES_URL', 'http://yadl.image.bucket.s3-website-us-east-1.amazonaws.com')

.run( function( $rootScope, $state, $ionicPlatform ) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
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
    })
    .state('stream', {
      url: '/stream',
      templateUrl: 'js/stream/views/stream.tmpl.html',
      controller: 'StreamController',
      controllerAs: 'stream'
    })
    .state('thankyou', {
      url: '/thankyou',
      templateUrl: 'js/stream/views/thankyou.tmpl.html',
    });
  
  $urlRouterProvider.otherwise('/auth');
})

.factory('AuthFactory', ['localStorageService', 
  function(localStorageService){
  
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
      return getToken( );
    }

    return{
      checkAuth: checkAuth
    };
}])

.factory('StreamFactory', ['$q', '$http', 'YADL_IMAGES_URL',
  function($q, $http, YADL_IMAGES_URL){

    var streamList = [];

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

    function getStream( ){
      var deferred = $q.defer();
      
      getMetaFile()
        .then(function(){
          deferred.resolve(streamList);
        })
        .catch(function(err){
          deferred.reject( err );
        })

      return deferred.promise;
    }

    return{
      getStream: getStream
    };
}])

.controller('AuthController', ['$rootScope', '$window', 
  '$ionicPlatform', '$cordovaInAppBrowser', 'AuthFactory', 'YADL', 
  function($rootScope, $window, $ionicPlatform, 
    $cordovaInAppBrowser, AuthFactory, YADL){
  
    var vm = this;

    var ohmageStrategy = function( ){
      // var ohmageUrl = 'https://ohmage-omh.smalldata.io/dsu/oauth/authorize?client_id=' + YADL + '&response_type=token';
      $state.go('stream');      

      // $ionicPlatform.ready(function() {
        
      //   $cordovaInAppBrowser.open(ohmageUrl, '_blank', { 
      //                                                   location: 'yes',
      //                                                   clearcache: 'no',
      //                                                   clearsessioncache: 'no',
      //                                                   toolbar: 'no',
      //                                                   toolbarposition: 'bottom'
      //                                                  });
      // });
    };
    vm.ohmageStrategy = ohmageStrategy;

    function init( ){

    } init( );

    // Listen to in-app browser events to monitor URL for 
    // succesfull oauth completion
    $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){

      var url = event.url.split('#')
      if( url.length > 1 ){
        alert('ok it didnt crash')
        var params = url.substr(1).split('&')
        var accessToken = params[0].split('=')[1];
        console.log(accessToken);
        $cordovaInAppBrowser.close();
      }

    });
}])

.controller('StreamController', ['$state', 'StreamFactory', 
  function($state, StreamFactory){
    var vm = this;
    vm.list = [];
    vm.indx = 0;

    function submitResponses( ){
      // submit responses
    }

    var makeResponse = function( response ){

      vm.list[vm.indx]['activity_intensity'] = response;
      vm.list[vm.indx]['activity_image_index'] = vm.indx;
      
      if( vm.indx < vm.list.length - 1 ){
        vm.indx += 1;   
      }else{
        submitResponses( );
        $state.go('thankyou');
      }
    };
    vm.makeResponse = makeResponse;

    function init( ){
      StreamFactory.getStream( )
        .then(function(list){
          vm.list = list;
          console.log(list)
        })
    } init( );

}])