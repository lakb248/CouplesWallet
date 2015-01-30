var Note = require('../models/note') ;
//add note
exports.addNote = function(req,res){
	var title = req.body.title ;
	var content = req.body.content ;

	Note.addNote(title,content, function(note){
		res.json({'status':1,'note':note}) ;
	},function(object,error){
		res.json({'status':0,'message':error}) ;
	}) ;
} ;
//update note
exports.updateNote = function(req,res){
	var id = req.params.note_id ;
	var title = req.body.title ;
	var content = req.body.content ;

	Note.updateNote(id,title,content,function(note){
		res.json({'status':1,'note':note}) ;
	},function(object,error){
		res.json({'status':0,'message':error}) ;
	}) ;
} ;
//get all notes
exports.getAllNotes = function(req,res){
	Note.findAll(function(notes){
		console.log(notes) ;
		res.json({'status':1,'notes':notes}) ;
	},function(object,error){
		res.json({'status':0,'message':error}) ;
	})
} ;
//get note by id
exports.getNote = function(req,res){
	var id = req.params.note_id ;
	Note.findById(id,function(note){
		res.json({'status':1,'note':note}) ;
	},function(object,error){
		res.json({'status':0,'message':error}) ;
	}) ;
} ;
//delete note
exports.deleteNote = function(req,res){
	var id = req.params.note_id ;
	Note.delete(id,function(note){
		res.json({'status':1}) ;
	},function(object,error){
		res.json({'status':0,'message':error}) ;
	}) ;
} ;
