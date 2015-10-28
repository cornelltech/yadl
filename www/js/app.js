angular.module('yadl', ['ionic', 'ui.router', 'LocalStorageModule'])

.run( function( $ionicPlatform ) {
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
    })
    .state('config', {
      url: '/config',
      templateUrl: 'js/config/views/config.tmpl.html',
    })
    .state('stream', {
      url: '/stream',
      templateUrl: 'js/stream/views/stream.tmpl.html',
    })
    
  $urlRouterProvider.otherwise('/auth');
})
