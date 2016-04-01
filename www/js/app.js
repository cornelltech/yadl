// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('yadl', ['ionic', 'ngCordova', 'LocalStorageModule', 'angular-spinkit'])

.constant('VERSION', '3.0.7')
.constant('DEFAULTS', {
  "yadlClientName": "yadl-client",
  "yadlOhmageOMHLocation": "https://ohmage-omh.smalldata.io",
  "yadlConfigurationLocation": "http://yadl.image.bucket.s3-website-us-east-1.amazonaws.com"
})

.run(['$ionicPlatform', '$state', '$cordovaStatusbar', 'AssetFactory', 'OpenUrlService', 'DEFAULTS', 
  function($ionicPlatform, $state, $cordovaStatusbar, AssetFactory, OpenUrlService, DEFAULTS) {
    
    $ionicPlatform.ready(function() {

      console.log('[.run()]: $ionicPlatform.ready()');

      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.cordova && window.StatusBar) {
        $cordovaStatusbar.style(1);
      }

      // Load up the JSON config file on load
      AssetFactory.fetchConfig();

      // schedule notification 
      if(window.cordova && window.cordova.plugins.notification){

        cordova.plugins.notification.local.on("click", function(notification) {
          if(notification.id == 1){
            $state.go('monthly', {'objID': 0});
          }else{
            $state.go('daily');
          }
        });
      
      }

      // listen for deep links
      if(OpenUrlService){
        console.log("[run] OpenURL Service!");
        document.addEventListener('handleopenurl', OpenUrlService.handleOpenUrl, false);
        document.addEventListener('resume', OpenUrlService.onResume, false);
      }

    });
}])

.config(['localStorageServiceProvider', 
  function(localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('yadl');
}])

// configure the states
.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('auth', {
        url: '/auth',
        templateUrl: 'js/accounts/partials/auth.tmpl.html',
        controller: 'AuthController',
        controllerAs: 'auth'
      })
      .state('config', {
        url: '/config',
        templateUrl: 'js/utilities/partials/config.tmpl.html',
        controller: 'ConfigController',
        controllerAs: 'config'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'js/accounts/partials/settings.tmpl.html',
        controller: 'SettingsController',
        controllerAs: 'settings'
      })
      .state('daily', {
        url: '/daily',
        templateUrl: 'js/surveys/partials/daily.tmpl.html',
        controller: 'DailyController',
        controllerAs: 'daily'
      })
      .state('monthly', {
        url: '/monthly/:objID',
        templateUrl: 'js/surveys/partials/monthly.tmpl.html',
        controller: 'MonthlyController',
        controllerAs: 'monthly'
      })
      .state('thankyou', {
        url: '/thankyou',
        templateUrl: 'js/utilities/partials/thankyou.tmpl.html'
      })

    $urlRouterProvider.otherwise('/daily');  
}])


// Configure listeners for deep links
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


