var express = require('express') ;
var router = express.Router() ;
var noteController = require('../controllers/noteController') ;

/****note router****/
//add note
router.route('/note')
	.post(noteController.addNote) ;
//get and update note
router.route('/note/:note_id')
	.get(noteController.getNote)
	.put(noteController.updateNote)
	.delete(noteController.deleteNote);
//get all notes
router.route('/notes').get(noteController.getAllNotes) ;
module.exports = router ;