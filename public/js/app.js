// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var couples = angular.module('couples', ['ionic','ngRoute']) ;

//Controller

var couplesController = couples.controller('couplesController', ['$scope','$http',function($scope,$http){

}]) ;

var loginController = couples.controller('loginController', function($scope){
  $scope.email = 'email' ;
  $scope.password = 'password' ;
  $scope.login = function(){alert('login');} ;
}) ;

couples.config(['$routeProvider',function($routeProvider){
	$routeProvider.when('/',{
		templateUrl:'views/login.html',
		controller:'loginController'
	}) ;
}]) ;

