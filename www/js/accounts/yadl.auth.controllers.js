function AuthController( AuthFactory ){
  var vm = this;

  var signin = function(){
    AuthFactory.signIn();
  };
  vm.signin = signin;

  function init(){
    console.log("[AuthControllers()]: init()");
  } init();

}

AuthController.$inject = ['AuthFactory'];
angular.module('yadl')
  .controller('AuthController', AuthController);