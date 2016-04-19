function MonthlyController( $window, $state, SurveysFactory, AssetFactory, AuthFactory, UtilityFactory ){
  var vm = this;
  vm.object = null;
  vm.numberOfObjs = null;
  vm.config = null;
  
  vm.height = $window.innerHeight * 0.55;

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
  	}else if(rating === 0){
      submitResponses();
    }else{
  		submitResponses();
  	}
  };
  vm.rate = rate;
  
  function init(){
    console.log("[MonthlyController()]: init()");
    AuthFactory.requireAuth();
    
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

MonthlyController.$inject = ['$window',  '$state', 'SurveysFactory', 'AssetFactory', 'AuthFactory', 'UtilityFactory'];
angular.module('yadl')
  .controller('MonthlyController', MonthlyController);




function DailyController( $window, $state, AuthFactory, SurveysFactory, AssetFactory, UtilityFactory ){
  var vm = this;
  vm.list = SurveysFactory.getDailyObjects();
  vm.selectedActivities = [];

  vm.width = $window.innerWidth / 3 - 25; 

  var isSelected = function( obj ){
    var results = vm.selectedActivities.filter(function(a){
        return (obj.id == a.id);
    });
    if( results.length > 0){
      return true;
    }else{
      return false;
    }
  };
  vm.isSelected = isSelected;

  var selectActivity = function( obj ){
    if(!isSelected(obj)){
      obj.selected = true;
      vm.selectedActivities.push(obj);  
    }else{
      for(var i=0; i<vm.selectedActivities.length; i++){
        if( vm.selectedActivities[i].id == obj.id){
          vm.selectedActivities[i].selected = false;
          vm.selectedActivities.splice( i, 1 );      
        }
      }
    }
  };
  vm.selectActivity = selectActivity;

  var submitSelection = function(){
    SurveysFactory.submitDaily(vm.selectedActivities)
      .then(function(r){
        $state.go('thankyou');
      });
  };
  vm.submitSelection = submitSelection;
  
  function init(){
    console.log("[DailyController()]: init()");

    AuthFactory.requireAuth();

  } init();

}

DailyController.$inject = ['$window', '$state', 'AuthFactory', 'SurveysFactory', 'AssetFactory', 'UtilityFactory'];
angular.module('yadl')
  .controller('DailyController', DailyController);