var User = require('../models/user') ;
//add user
exports.postUser = function(req,res){
	console.log({
		username: req.body.username ,
		password: req.body.password ,
		token : req.body.username + ':' + req.body.password
	}) ;
	//instance a user
	var user = new User({
		username: req.body.username ,
		password: req.body.password ,
		token : req.body.username + ':' + req.body.password
	}) ;
	//save user
	user.save(function(err){
		if(err){
			res.send(err) ;
		}else{
			res.json({'message':'success'}) ;
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
				res.send(err) ;
			}

			res.json({'message':'success'}) ;
		}
	);
} ;
//get user
exports.getUser = function(req,res){
	User.find({_id:req.param.userId},function(err,user){
		if(err){
			res.send(err) ;
		}

		res.json(user) ;
	}) ;
} ;
//user login
exports.login = function(req,res){
	User.find({username:req.body.username,password:req.body.username},function(err,user){
		if(err){
			res.json({'message':'-1'}) ;
		}
		res.json({'message':user._id}) ;
	}) ;
} ;