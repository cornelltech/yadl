function AuthFactory($rootScope, $q, $state, $ionicPlatform, $cordovaInAppBrowser, localStorageService, AssetFactory, UtilityFactory){
	
	var setOhmageToken = function( token ){
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
    $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){

      	var url = event.url.split('#')
      
      	if( url.length > 1 && url[0].indexOf('ohmage-omh.smalldata.io') > -1){

        	var params = url[1].substr(1).split('&')
        	var accessToken = params[0].split('=')[1];

        	if(accessToken){

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

		},

		getOhmageToken: function(){
			var token = localStorageService.get('ohmageToken');
			if(token){ return token; }

			UtilityFactory.popupWarning('Please sign in.')
				.then(function(){
					$state.go('auth');
				});
		}
	};

}

AuthFactory.$inject = ['$rootScope', '$q', '$state', '$ionicPlatform', '$cordovaInAppBrowser', 'localStorageService', 'AssetFactory', 'UtilityFactory'];
angular.module('yadl')
  .factory('AuthFactory', AuthFactory);