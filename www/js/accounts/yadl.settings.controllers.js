function SettingsController( $window, AuthFactory ){
  var vm = this;

  var goBack = function(){
    $window.history.back();
  };
  vm.goBack = goBack;

  function init(){
    console.log("[SettingsControllers()]: init()");
  } init();

}

SettingsController.$inject = ['$window', 'AuthFactory'];
angular.module('yadl')
  .controller('SettingsController', SettingsController);