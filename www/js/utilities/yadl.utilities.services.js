function UtilityFactory($q, $ionicPopup, $cordovaLocalNotification, localStorageService, VERSION){
	
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
		console.log('UtilityFactory: Scheduling Daily Notification for ' + JSON.stringify(time));
		// if(window.cordova && window.cordova.plugins.notification){
			$cordovaLocalNotification.schedule({
	          	id: parseInt(Math.random()*1000000),
	          	text: "Time to do your Spot YADL survey.",
	          	every: "day",
	          	at: time
	        }).then(function(r){
				console.log("scheduleDailyNotification() Success")
				console.log(JSON.stringify(r));
			}).catch(function(e){
				console.log("scheduleDailyNotification() Error")
				console.log(JSON.stringify(e));
			});
		// }else{
		// 	console.log("scheduleDailyNotification() Plugin not found");
		// }
	};

	var scheduleMonthlyNotification = function(time){
		console.log('UtilityFactory: Scheduling Monthly Notification for ' + JSON.stringify(time));
		// if(window.cordova && window.cordova.plugins.notification){
			$cordovaLocalNotification.schedule({
	          	id: parseInt(Math.random()*1000000),
	          	text: "Time to do your Full YADL survey.",
	          	every: "month",
	          	at: time
	        }).then(function(r){
				console.log("scheduleMonthlyNotification() Success")
				console.log(JSON.stringify(r));
			}).catch(function(e){
				console.log("scheduleMonthlyNotification() Error")
				console.log(JSON.stringify(e));
			});
		// }{
		// 	console.log("scheduleMonthlyNotification() Plugin not found");
		// }
	};
    
    var scheduleSnoozeNotification = function(time){
        if(window.cordova && window.cordova.plugins.notification){
			$cordovaLocalNotification.schedule({
	          	id: parseInt(Math.random()*1000000),
	          	text: "Don't forget to do  your Spot YADL survey.",
	          	every: "day",
	          	at: time
	        }).then(function(r){
				console.log("scheduleSnoozeNotification() Success")
				console.log(JSON.stringify(r));
			}).catch(function(e){
				console.log("scheduleSnoozeNotification() Error")
				console.log(JSON.stringify(e));
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

    	scheduleNotifications: function( time ){
			console.log('==============');
			console.log("scheduleNotifications()");
			console.log('==============');

    		var deferred = $q.defer();
    		// if we are scheduling new notification times, cancel the old
    		clearNotifications();
			
			var time = time || new Date();
			cacheNotificationTime( time );

			console.log("It is now " + JSON.stringify(time))

			// var _1_minute_from_now = new Date( moment( time ).add(1, 'minutes') );
			// scheduleDailyNotification(_1_minute_from_now);
			
			var _1_day_from_now = new Date( moment( time ).add(1, 'days') );
			scheduleDailyNotification(_1_day_from_now);
			
			var _1_day_and_a_little_from_now = new Date( moment( time ).add(1, 'days').add(5, 'minutes') );
			scheduleSnoozeNotification(_1_day_and_a_little_from_now);

			var _1_month_from_now = new Date( moment( time ).add(1, 'months') );
    		scheduleMonthlyNotification(_1_month_from_now)

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