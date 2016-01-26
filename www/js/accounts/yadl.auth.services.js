function AuthFactory($rootScope, $q, $state, $ionicPlatform, $cordovaInAppBrowser, localStorageService, AssetFactory, UtilityFactory){
	
	var setOhmageToken = function( ohmageToken ){
		return localStorageService.set('ohmageToken', ohmageToken);
	};

	var launchInAppBrowser = function( ){
		var ohmageUrl = AssetFactory.getOhmageOMHLocation() + '/dsu/oauth/authorize?client_id=' + AssetFactory.getYADLClientName() + '&response_type=token';
	    $ionicPlatform.ready(function() {

		    $cordovaInAppBrowser.open(ohmageUrl, 
		     	'_blank', 
		     	{
	            	location: 'yes',
	            	clearcache: 'no',
	            	clearsessioncache: 'no',
	            	toolbar: 'no'
	           	});
		});

	};

	// Listen to in-app browser events to monitor URL for 
    // succesfull oauth completion
    $rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event){
      	// alert(event.url)
      	var url = event.url.split('#');
      	console.log(url)
      	if( url.length > 1 && url[1].indexOf('access_token') > -1){
        	var params = url[1].split('&');
        	var accessToken = params[0].split('=')[1];
        	if(accessToken){
        		console.log('$cordovaInAppBrowser:loadstart Condition Met, storing access token');
          		setOhmageToken( accessToken );
          		$cordovaInAppBrowser.close();  
        	}
      	}
    });

    $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){
      $state.go( 'monthly', { 'objID': 0 } );
    });

	return {

		signIn: function(){
			launchInAppBrowser( );
		},

		signOut: function(){
			localStorageService.clearAll();
			$state.go('auth');
		},

		getOhmageToken: function(){
			var token = localStorageService.get('ohmageToken');
			if(token){ return token; }

			UtilityFactory.popupWarning('Please sign in.')
				.then(function(){
					$state.go('auth');
				});
		},

		requireAuth: function(){
			var token = localStorageService.get('ohmageToken');
			console.log(token);
			if(!token){
				$state.go('auth');
			}
		}
	};

}

AuthFactory.$inject = ['$rootScope', '$q', '$state', '$ionicPlatform', '$cordovaInAppBrowser', 'localStorageService', 'AssetFactory', 'UtilityFactory'];
angular.module('yadl')
  .factory('AuthFactory', AuthFactory);