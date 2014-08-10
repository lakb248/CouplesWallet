var User = require('../models/user') ;
//add user
exports.postUser = function(req,res){

	//instance a user
	var user = new User({
		username: req.body.username ,
		password: req.body.password ,
		token : new Date().getTime()
	}) ;
	//save user
	user.save(function(err){
		if(err){
			res.json({'result':{'status':'-1'}}) ;
		}else{
			res.json({'result':{'status':'1','userId':user._id,'token':user.token}}) ;
		}
	}) ;
} ;
//update user
exports.updateUser = function(req,res){
	User.update(
		{_id:req.body.userId} ,
		{username:req.body.username , password:req.body.password},
		function(err,num,raw){
			if(err){
				res.json({'result':{'status':'-1'}}) ;
			}else{
				res.json({'result':{'status':'1'}}) ;
			}
		}
	);
} ;
//get user
exports.getUser = function(req,res){
	User.find({_id:req.param.userId},function(err,user){
		if(err){
			res.json({'result':{'status':'-1'}}) ;
		}else{
			res.json({'result':{'status':'1','user':user}}) ;
		}

	}) ;
} ;
//user login
exports.login = function(req,res){
	if(req.body.token){
		//find user by token
		User.find({token:req.body.token},function(err,users){
			if(err){
				res.json({'result':{'status':'-1'}}) ;
			}else if(users.length <= 0){
				//there is no user whose token is equal to token in request,login failed
				res.json({'result':{'status':'0','message':'error'}}) ;
			}else{
				//login success , update token
				var newToken = new Date().getTime() ;
				User.update(
					{_id:users[0]._id} ,
					{token:newToken} ,
					function(err,num,raw){

						if(err){
							res.json({'result':{'status':'-1'}}) ;
						}else{
							res.json({'result':{'status':'1','userId':users[0]._id,'token':newToken}}) ;
						}
					}
				) ;
			}
		}) ;
	}else{
		User.find({username:req.body.username,password:req.body.password},function(err,users){
			if(err){
				res.json({'result':{'status':'-1'}}) ;
			}else if(users.length <= 0){
				//there is no user whose token is equal to token in request,login failed
				res.json({'result':{'status':'0','message':'error'}}) ;
			}else{
				var newToken = new Date().getTime() ;
				User.update(
					{_id:users[0]._id} ,
					{token:newToken} ,
					function(err,num,raw){

						if(err){
							res.json({'result':{'status':'-1'}}) ;
						}else{
							res.json({'result':{'status':'1','userId':users[0]._id,'token':newToken}}) ;
						}
					}
				) ;
			}
			
		}) ;
	}
	
} ;