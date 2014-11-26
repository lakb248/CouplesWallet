var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

var UserSchema = new Schema({
	username : {
		type: String ,
		unique: true ,
		required: true 
	} ,
	password: {
		type: String ,
		required: true 
	} ,
	token : String 
}) ;

UserSchema.method.verifyPassword = function(password,callback){
	if(this.password === password){
		callback('success') ;
	}else{
		callback('failure') ;
	}
} ;

module.exports = mongoose.model('User',UserSchema) ;
