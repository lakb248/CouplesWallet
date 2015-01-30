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
		}
	}
}) ;