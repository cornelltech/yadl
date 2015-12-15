function ConfigController( AssetFactory, UtilityFactory ){
  var vm = this;

  vm.yadlClientName = AssetFactory.getYADLClientName();
  vm.yadlOhmageOMHLocation = AssetFactory.getOhmageOMHLocation();
  vm.yadlConfigurationLocation = AssetFactory.getYADLConfigLocation();

  var update = function(){
    if( vm.yadlClientName && vm.yadlOhmageOMHLocation && vm.yadlConfigurationLocation){
      AssetFactory.setYADLClientName(vm.yadlClientName);
      AssetFactory.setOhmageOMHLocation(vm.yadlOhmageOMHLocation);
      AssetFactory.setYADLConfigLocation(vm.yadlConfigurationLocation);
      UtilityFactory.popupSuccess("Settings have been updated.");
    }else{
      UtilityFactory.popupWarning("Please make sure all fields are correct.");
    }
  };
  vm.update = update;
  
  function init(){
    console.log("[ConfigController()]: init()");
  } init();

}

ConfigController.$inject = ['AssetFactory', 'UtilityFactory'];
angular.module('yadl')
  .controller('ConfigController', ConfigController);