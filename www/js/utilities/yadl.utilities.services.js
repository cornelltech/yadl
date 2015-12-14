function UtilityFactory($q, $ionicPopup){
	
	return {
		guid: function() {
      		
      			function s4() {
        			return Math.floor((1 + Math.random()) * 0x10000)
          				.toString(16)
          				.substring(1);
      			}

      			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    	},

    	popupWarning: function(msg){
    		var alertPopup = $ionicPopup.alert({
		     title: 'Warning',
		     template: msg
		   	});
		   	return alertPopup;
    	},
    	popupSuccess: function(msg){
    		var alertPopup = $ionicPopup.alert({
		     title: 'Success',
		     template: msg
		   	});
		   	return alertPopup;
    	}
	};


}

UtilityFactory.$inject = ['$q', '$ionicPopup'];
angular.module('yadl')
  .factory('UtilityFactory', UtilityFactory);




function AssetFactory($q, $http, localStorageService, UtilityFactory, DEFAULTS){

	var setYADLClientName = function(yadlClientName){
		return localStorageService.set('yadlClientName', yadlClientName);
	};

	var setOhmageOMHLocation = function(ohmageOMHLocation){
		return localStorageService.set('ohmageOMHLocation', ohmageOMHLocation);
	};

	var setYADLConfigLocation = function(yadlConfigLocation){
		return localStorageService.set('yadlConfigLocation', yadlConfigLocation);
	};

	return {
		
		getYADLClientName: function( ){
			var yadlClientName = localStorageService.get('yadlClientName');
			if(yadlClientName){
				return yadlClientName;
			}else{
				setYADLClientName(DEFAULTS.yadlClientName);
				return DEFAULTS.yadlClientName;
			}
			
		},

		getOhmageOMHLocation: function( ){
			var ohmageOMHLocation = localStorageService.get('ohmageOMHLocation');
			if( ohmageOMHLocation ){ 
				return ohmageOMHLocation; 
			}else{
				setOhmageOMHLocation(DEFAULTS.yadlOhmageOMHLocation);
				return DEFAULTS.yadlOhmageOMHLocation	
			}
		},

		getYADLConfigLocation: function( ){
			var yadlConfigLocation = localStorageService.get('yadlConfigLocation');
			if( yadlConfigLocation ){
				return yadlConfigLocation;	
			}else{
				setYADLConfigLocation(DEFAULTS.yadlConfigurationLocation);
				return DEFAULTS.yadlConfigurationLocation	
			}
		},

		fetchConfig: function(){
			var deferred = $q.defer();
			var config = localStorageService.get('config');

			if( config ){

				deferred.resolve(config);

			}else{

				$http({
					method: 'GET',
					url: DEFAULTS.yadlConfigurationLocation + '/config.json'
				})
				.then(function(r){
					localStorageService.set('config', r.data);
					deferred.resolve(r.data);
				})
				.catch(function(e){
					UtilityFactory.popupWarning('There was an issue reaching the server, try again later.')
					deferred.reject(e);
				});

			}
			

			return deferred.promise;
		}

	};
}

AssetFactory.$inject = ['$q', '$http', 'localStorageService', 'UtilityFactory', 'DEFAULTS'];
angular.module('yadl')
  .factory('AssetFactory', AssetFactory);





function OpenUrlService($log, $location, $rootScope, $ionicHistory, $state) {

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

}

OpenUrlService.$inject = ['$log', '$location', '$rootScope', '$ionicHistory', '$state'];
angular.module('yadl')
  .factory('OpenUrlService', OpenUrlService);