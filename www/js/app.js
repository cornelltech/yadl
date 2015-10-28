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
      controller: 'StreamController'
    })
    .state('thankyou', {
      url: '/thankyou',
      templateUrl: 'js/stream/views/thankyou.tmpl.html',
    })
    
  $urlRouterProvider.otherwise('/auth');
})

.controller('StreamController', ['$scope', '$state', function($scope, $state){
  $scope.index = 0;
  $scope.streamItems = ['https://media.giphy.com/media/hyg2C8bS7IBuo/giphy.gif','https://media.giphy.com/media/zzT0RjyxQGDaE/giphy.gif','https://media.giphy.com/media/10xOn1VHkwievm/giphy.gif']

  $scope.nextItem = function( ){
    if($scope.index < $scope.streamItems.length - 1){
      $scope.index = $scope.index + 1;
    }else{
      $state.go('thankyou')
    }
  }
}])