function MonthlyController( $state, SurveysFactory, AssetFactory, UtilityFactory ){
  var vm = this;
  vm.object = null;
  vm.numberOfObjs = null;
  vm.config = null;

  var submitResponses = function( ){
  	SurveysFactory.submitMonthly( )
  		.then(function(r){
  			$state.go('thankyou');
  		});
  };

  var rate = function(rating){

  	SurveysFactory.rateObject($state.params.objID, rating);

  	if($state.params.objID < vm.numberOfObjs - 1){
  		$state.go('monthly', {objID: parseInt($state.params.objID) + 1});
  	}else{
  		submitResponses();
  	}
  };
  vm.rate = rate;
  
  function init(){
    console.log("[MonthlyController()]: init()");

    console.log("[MonthlyController()]: Loading monthly config");
    AssetFactory.fetchConfig()
    	.then(function(config){
    		vm.numberOfObjs = config.data.length;
    		vm.config = config.surveys.monthly;
    	})

    console.log("[MonthlyController()]: Getting object " + $state.params.objID);
    SurveysFactory.getObject($state.params.objID)
    	.then(function(obj){
    		vm.object = obj;
    	})

  } init();

}

MonthlyController.$inject = ['$state', 'SurveysFactory', 'AssetFactory', 'UtilityFactory'];
angular.module('yadl')
  .controller('MonthlyController', MonthlyController);




function DailyController( $state, SurveysFactory, AssetFactory, UtilityFactory ){
  var vm = this;
  
  function init(){
    console.log("[DailyController()]: init()");

  } init();

}

DailyController.$inject = ['$state', 'SurveysFactory', 'AssetFactory', 'UtilityFactory'];
angular.module('yadl')
  .controller('DailyController', DailyController);