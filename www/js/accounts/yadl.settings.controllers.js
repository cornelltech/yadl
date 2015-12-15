function SettingsController( $window, AuthFactory, UtilityFactory, VERSION ){
  var vm = this;
  vm.version = VERSION;
  vm.reminderTime = UtilityFactory.getNotificationTime();

  var goBack = function(){
    $window.history.back();
  };
  vm.goBack = goBack;

  var signOut = function(){
  	AuthFactory.signOut();
  };
  vm.signOut = signOut;

  var schedule = function(){
  	UtilityFactory.scheduleNotifications(vm.reminderTime)
  		.then(function(){
  			UtilityFactory.popupSuccess('Scheduled Notifications')
  		})
  };
  vm.schedule = schedule;

  function init(){
    console.log("[SettingsControllers()]: init()");
  } init();

}

SettingsController.$inject = ['$window', 'AuthFactory', 'UtilityFactory', 'VERSION'];
angular.module('yadl')
  .controller('SettingsController', SettingsController);