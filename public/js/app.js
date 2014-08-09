// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var couples = angular.module('couples', ['ionic','ui.router']) ;


couples.config(function($stateProvider,$urlRouterProvider){
	$urlRouterProvider.otherwise('/index') ;
	$stateProvider
		.state('index',{
			url:'/index',
			views:{
				'header':{templateUrl:'views/index_header.html'},
				'container':{template:'Hello,World!!!'}
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

couples.run(function($rootScope){
	$rootScope.isLoaded = true ;
}) ;

//Controller

var couplesController = couples.controller('couplesController',function($scope,$location,$state){
	//$scope.isLoaded = false ;
	$scope.register = function(){
		// $location.path('/register') ;
		$state.go('register') ;
	} ;
}) ;

var loginController = couples.controller('loginController', ['$scope','UserService',function($scope,userService){
  	$scope.username = '' ;
  	$scope.password = '' ;
  	$scope.login = function(){
  		if($scope.username.length === 0){
  			alert('Please Enter Your Username') ;
  		}else if($scope.password.length === 0){
  			alert('Please Enter Your Password') ;
  		}else{
  			var token = userService.login($scope.username,$scope.password) ;
  		}

  	} ;
  
}]) ;

var registerController = couples.controller('registerController',['$scope','UserService',function($scope,userService){
	$scope.register = function(){
		//alert('username:' + $scope.username + ';password:' + $scope.password) ;
		if($scope.password !== $scope.confirmPass){
			alert('different password') ;
		}else{
			userService.register($scope.username,$scope.password) ;
		}

	} ;
}]) ;
/************************Service*************************/
/******************UserService***********************/
couples.factory('UserService', function($http){
	return {
		register:function(username,password){

			$http.post(
				'/api/register',
				{username:username,password:password}
			).success(function(data){
				console.log(data.message) ;
				if(data.message === 'success'){
					alert('success') ;
				}else{
					alert('fail') ;
				}
			}).error(function(status,data){
				alert(data) ;
			}) ;
		} ,
		updateUser:function(username,password,userId){
			$http.post(
				'/api/updateUser',
				{username:username,password:password,userId:id}
			).success(function(data){
				console.log(data) ;
			}).error(function(status,data){
				console.log(data) ;
			}) ;

		} ,
		getUser:function(id){
			$http.get(
				'/api/getUser',
				{userId:id}
			).success(function(data){
				console.log(data) ;
			}).error(function(status,data){
				console.log(data) ;
			}) ;
		}
	}
}) ;


