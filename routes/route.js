var express = require('express') ;
var router = express.Router() ;
var userController = require('../controllers/userController') ;

//register
router.route('/register')
	.post(userController.postUser) ;
//login
router.route('/login')
	.post(userController.login) ;
//get user info
router.route('/user/:user_id')
	.get(userController.getUser) ;

module.exports = router ;