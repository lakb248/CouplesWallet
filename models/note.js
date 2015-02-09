var avos = require('../models/avos') ;
var Note = avos.Object.extend('Note') ;

//add note
exports.addNote = function(title,content,success,error){
    var query = new avos.Query(Note) ;
	var note = new Note() ;
	note.set('title',title) ;
	note.set('content',content) ;
	note.save(null,{
		success : success,
		error : error
	}) ;
} ;
//update note
exports.updateNote = function(id,title,content,success,error){
    var query = new avos.Query(Note) ;
	query.get(id,{
		success : function(note){
			note.set('title',title) ;
			note.set('content',content) ;
			note.save(null,{
				success : success ,
				error : error
			}) ;
		},
		error : error
	}) ;
} ;
//find note by id
exports.findById = function(id,success,error){
    var query = new avos.Query(Note) ;
	query.get(id,{
		success : success ,
		error : error
	}) ;
} ;
//find all notes
exports.findAll = function(success,error){
    var query = new avos.Query(Note) ;
	query.descending('createdAt') ;
	query.find({
		success : success ,
		error : error
	}) ;
} ;
//delete note
exports.delete = function(id,success,error){
    var query = new avos.Query(Note) ;
	query.get(id,{
        success : function(note){
            note.destroy({
                success : success ,
                error : error
            }) ;
        },
        error : error
    }) ;
} ;
