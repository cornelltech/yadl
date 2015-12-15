function SettingsController( $window, AuthFactory, VERSION ){
  var vm = this;
  vm.version = VERSION;

  var goBack = function(){
    $window.history.back();
  };
  vm.goBack = goBack;

  var signOut = function(){
  	AuthFactory.signOut();
  };
  vm.signOut = signOut();

  function init(){
    console.log("[SettingsControllers()]: init()");
  } init();

}

SettingsController.$inject = ['$window', 'AuthFactory', 'VERSION'];
angular.module('yadl')
  .controller('SettingsController', SettingsController);