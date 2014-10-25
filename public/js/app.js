
var couples = angular.module('couples', ['ionic','ui.router']) ;

//config router test appcache
couples.config(function($stateProvider,$urlRouterProvider){
	$urlRouterProvider.otherwise('/index') ;
	$stateProvider
		.state('index',{
			url:'/index',
			views:{
				'header':{templateUrl:'views/main_header.html'},
				'container':{templateUrl:'views/main.html'}
			}
		})
		.state('login',{
			url:'/login',
			views: {
		    	'header': { templateUrl: 'views/login_header.html' },
		    	'container': { templateUrl: 'views/login.html',controller:'loginController'}
		    }
		})
		.state('register',{
			url:'/register',
			views: {
		    	'header': { templateUrl: 'views/register_header.html' },
		    	'container': { templateUrl: 'views/register.html',controller:'registerController'}
		    }
		});
}) ;

//config services

/******************UserService***********************/
couples.factory('UserService', ['$http',function($http){
	return {
		register:function(username,password,success,fail){

			$http.post(
				'/api/register',
				{username:username,password:password}
			).success(success).error(fail) ;
		} ,
		loginByUsername:function(username,password,success,fail){
			$http.post(
				'/api/login' ,
				{username:username,password:password} 
			).success(success).error(fail) ;
		} ,
		loginByToken:function(token,success,fail){
			$http.post(
				'/api/login' ,
				{token:token} 
			).success(success).error(fail) ;
		} ,
		updateUser:function(user,success,fail){
			$http.post(
				'/api/updateUser',
				{username:user.username,password:user.password,userId:user.id}
			).success(success).error(fail) ;

		} ,
		getUser:function(id,success,fail){
			$http.get(
				'/api/getUser',
				{userId:id}
			).success(success).error(fail) ;
		}
	}
}]) ;
// module run block
couples.run(['$rootScope','$state','$location','$timeout','UserService',
	function($rootScope,$state,$location,$timeout,UserService){
	//login by token
	var token = localStorage.getItem('token') ;
	$rootScope.isLoaded = false ;
	if(token === null || token === undefined){
		//no token
		$location.path('/login') ;
	}else{
		//check token
		UserService.loginByToken(
			token ,
			function(data){
				var result = data.result ;
				if(result.status === '-1'){
					//out of data , clear the token
					localStorage.removeItem('token') ;
					$location.path('/login') ;
				}else if(result.status === '0'){
					alert('user does not exist') ;
					$location.path('/') ;
				}else{
					//login success,update token
					$rootScope.userId = result.userId ;
					localStorage.setItem('token',result.token) ;
					$location.path('/') ;
				}
			} ,
			function(status,data){
				alert(data) ;
			}
		) ;
	} ;
	$timeout(function(){$rootScope.isLoaded = true ;},1000) ;
}]) ;

//Controller

var couplesController = couples.controller(
	'couplesController',
	['$scope','$location','$state','UserService',
	function($scope,$location,$state,UserService){
		//$scope.isLoaded = false ;

		$scope.register = function(){
			// $location.path('/register') ;
			$state.go('register') ;
		} ;
}]) ;

var loginController = couples.controller(
	'loginController', 
	['$rootScope','$scope','UserService','$location',
	function($rootScope,$scope,userService,$location){
	  	$scope.username = '' ;
	  	$scope.password = '' ;
	  	$scope.login = function(){
	  		if($scope.username.length === 0){
	  			alert('Please Enter Your Username') ;
	  		}else if(!/^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/.test($scope.username)){
	  			alert('Please Enter The Correct Email') ;
	  		}else if($scope.password.length === 0){
	  			alert('Please Enter Your Password') ;
	  		}else if($scope.password.length < 8){
	  			alert('Your Password Must Over 8') ;
	  		}else{
	  			//login by username
	  			userService.loginByUsername(
	  				$scope.username , 
	  				$scope.password ,
	  				function(data){
	  					var result = data.result ;
	  					if(result.status === '-1'){
							alert('fail') ;
						}else if(result.status === '0'){
							//username or password is incorrect
							alert('user does not exist') ;
						}else{
							//login success,update token
							$rootScope.userId = result.userId ;
							localStorage.setItem('token',result.token) ;
							$location.path('/') ;
						}
	  				} ,
	  				function(status,data){
	  					alert(data) ;
	  				}
	  			) ;
	  		}

	  	} ; 
}]) ;

var registerController = couples.controller(
	'registerController',
	['$rootScope','$scope','UserService','$location',
	function($rootScope,$scope,userService,$location){
		$scope.register = function(){
			//alert('username:' + $scope.username + ';password:' + $scope.password) ;
			if($scope.username.length === 0){
	  			alert('Please Enter Your Username') ;
	  		}else if(!/^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/.test($scope.username)){
	  			alert('Please Enter The Correct Email') ;
	  		}else if($scope.password.length === 0){
	  			alert('Please Enter Your Password') ;
	  		}else if($scope.password.length < 8){
	  			alert('Your Password Must Over 8') ;
	  		}else if($scope.password !== $scope.confirmPass){
				alert('different password') ;
			}else{
				userService.register(
					$scope.username ,
					$scope.password ,
					function(data){
						var result = data.result ;
						if(result.status === '-1'){
							alert('fail') ;
						}else{
							$rootScope.userId = result.userId ;
							localStorage.setItem('token',result.token) ;
							$location.path('/') ;
						}
					} ,
					function(status,data){
						alert(data) ;
					}
				) ;
			}

		} ;
}]) ;