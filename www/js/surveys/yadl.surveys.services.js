function SurveysFactory($q, $http, localStorageService, AuthFactory, AssetFactory, UtilityFactory){
	
	var objects = [];

	var processObjects = function(config){

		objects = config.data;

		objects.map(function(obj, indx){

			obj.id = indx;
			obj.activity_image = config.assetsUrl + '/' + obj.file;
			obj.activity_name = obj.title;
			obj.activity_intensity = -1;
			obj.activity_image_index = indx;

			delete obj.title;
			delete obj.file

		});
		
	};

	var loadObjects = function(){
		var deferred = $q.defer();

		AssetFactory.fetchConfig()
			.then(function(r){
				processObjects(r)
				deferred.resolve();
			});

		return deferred.promise;
	};

	var findObject = function(id){
		for(var i=0; i<objects.length; i++){
			if(objects[i].id == id){
				return objects[i];
			}
		}
	};

	var cacheMonthlySelection = function( selection ){
		return localStorageService.set('monthlySelection', selection);
	};

	var getMonthlySelection = function( ){
		return localStorageService.get('monthlySelection');
	};

	var primaryFilteringCondition = function(obj){
		return obj.activity_intensity === 'Hard';
	};

	var secondaryFilteringCondition = function(obj){
		return obj.activity_intensity === 'Moderate';
	};

	var filterSelection = function(){
		var selection = objects.filter(primaryFilteringCondition);
		if( selection.length == 0 ){
			selection = objects.filter(secondaryFilteringCondition);
		}
		console.log(selection);
		return selection;
	};

	var postMonthlySelection = function( selection ){
		var deferred = $q.defer();
		var ohmagePackage = {
			"header": {
				"id": UtilityFactory.guid(),
				"creation_date_time": new Date(),
				"schema_id": {
					"namespace": "omh",
					"name": "yadl-monthly-survey",
					"version": "1.0"
				},
				"acquisition_provenance": {
					"source_name": "YADL",
					"modality": "self-reported"
				}
			},
			"body": {
				"activities": selection
			}
		};

      	$http({
      		url: AssetFactory.getOhmageOMHLocation() + '/dsu/dataPoints',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Authorization': 'Bearer ' + AuthFactory.getOhmageToken( ) },
            data: ohmagePackage
          })
      	.then(function(r){
      		deferred.resolve();
      	})
      	.catch(function(e){
      		UtilityFactory.popupWarning('There was an issue reaching the server, try signing in again or try later.');
      		deferred.reject();
      	})

		return deferred.promise;
	};

	return {

		getObjects: function(){
			var deferred = $q.defer();

			if( objects.length != 0 ){
				deferred.resolve(objects);
			}else{
				loadObjects()
					.then(function(r){
						deferred.resolve(objects);
					});
			}

			return deferred.promise;
		},

		getObject: function(id){
			var deferred = $q.defer();

			if( objects.length != 0 ){

				deferred.resolve(findObject(id));
			}else{
				loadObjects()
					.then(function(r){
						deferred.resolve(findObject(id));
					});
			}

			return deferred.promise;
		},

		rateObject: function(id, rating){
			var obj = findObject(id);
			obj.activity_intensity = rating;
		},

		submitMonthly: function(){
			var selection = filterSelection();
			cacheMonthlySelection( selection );
			return postMonthlySelection( objects );
		},

		getDailyObjects: function(){
			return localStorageService.get('monthlySelection');
		}



	};


}

SurveysFactory.$inject = ['$q', '$http', 'localStorageService', 'AuthFactory', 'AssetFactory', 'UtilityFactory'];
angular.module('yadl')
  .factory('SurveysFactory', SurveysFactory);