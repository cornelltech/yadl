function UtilityFactory($q, $ionicPopup, $cordovaLocalNotification, localStorageService){
	
    var notificationTime = function(){
        return localStorageService.get('notificationTime');
    }
    
	var cacheNotificationTime = function(time){
		return localStorageService.set('notificationTime', time);
	};

	var clearNotifications = function(){
		console.log('UtilityFactory: Clearing Notifications');
		if(window.cordova && window.cordova.plugins.notification){
			$cordovaLocalNotification.cancelAll();
		}
	};

	var scheduleDailyNotification = function(time){
		console.log('UtilityFactory: Scheduling Daily Notification for ' + time);
		if(window.cordova && window.cordova.plugins.notification){
			$cordovaLocalNotification.schedule({
	          	id: 0,
	          	text: "Time to do your Spot YADL survey.",
	          	every: "day",
	          	at: time
	        });
		}
	};

	var scheduleMonthlyNotification = function(time){
		console.log('UtilityFactory: Scheduling Monthly Notification for ' + time);
		if(window.cordova && window.cordova.plugins.notification){
			$cordovaLocalNotification.schedule({
	          	id: 1,
	          	text: "Time to do your Full YADL survey.",
	          	every: "month",
	          	at: time
	        });
		}
	};
    
    var scheduleSnoozeNotification = function(time){
        if(window.cordova && window.cordova.plugins.notification){
			$cordovaLocalNotification.schedule({
	          	id: 2,
	          	text: "Time to do your Full YADL survey.",
	          	every: "day",
	          	at: time
	        });
		}
    }

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
    	},

    	getNotificationTime: function(){
    		var coeff = 1000 * 60;
  			var date = new Date();
    		return new Date(localStorageService.get('notificationTime')) || new Date(Math.round(date.getTime() / coeff) * coeff);
    	},

    	scheduleNotifications: function(time){
    		var deferred = $q.defer();
    		// if we are scheduling new notification times, cancel the old
    		clearNotifications();
    		cacheNotificationTime(time);

    		var hours = time.getHours();
        	var mins = time.getMinutes();

            
	        Date.prototype.addDays = function(days){
	            var date = new Date(this.valueOf());
	            date.setDate(date.getDate() + days);
	            return date;
	        };
            
            Date.prototype.addMonths = function(months){
	            var date = new Date(this.valueOf());
	            date.setMonth(date.getMonth() + months);
	            return date;
	        };
            
            // daily notification
	        var _1_day_from_now = new Date();
	        _1_day_from_now = _1_day_from_now.addDays(1);
	        _1_day_from_now = new Date(_1_day_from_now.setHours(hours));
	        _1_day_from_now = new Date(_1_day_from_now.setMinutes(mins));

	        console.log("Scheduling Daily Notification for: ");
	        console.log(_1_day_from_now);

	        scheduleDailyNotification(_1_day_from_now);


            // daily snooze notification             
            var _1_day_from_now = new Date();
	        _1_day_from_now = _1_day_from_now.addDays(1);
	        _1_day_from_now = new Date(_1_day_from_now.setHours(hours));
	        _1_day_from_now = new Date(_1_day_from_now.setMinutes( parseInt(mins) + 10));

	        console.log("Scheduling Daily Snooze Notification for: ");
	        console.log(_1_day_from_now);

	        scheduleSnoozeNotification(_1_day_from_now);

            // monthly notification            
	        var _1_month_from_now = new Date();
	        _1_month_from_now = _1_month_from_now.addMonths(1);
	        _1_month_from_now = new Date(_1_month_from_now.setHours(hours));
	        _1_month_from_now = new Date(_1_month_from_now.setMinutes(mins));


	        console.log("Scheduling Monthly Notification for: ");
	        console.log(_1_month_from_now);

	        scheduleMonthlyNotification(_1_month_from_now);

	        deferred.resolve();

	        return deferred.promise;
    	}
	};


}

UtilityFactory.$inject = ['$q', '$ionicPopup', '$cordovaLocalNotification', 'localStorageService'];
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
		setYADLClientName: setYADLClientName,
        setOhmageOMHLocation: setOhmageOMHLocation,
        setYADLConfigLocation: setYADLConfigLocation,
        
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

			// if( config ){

			// 	deferred.resolve(config);

			// }else{

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

			// }
			

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