var express = require('express') ;
var router = express.Router() ;
var noteController = require('../controllers/noteController') ;
var taskController = require('../controllers/taskController') ;

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
router.route('/notes')
    .get(noteController.getAllNotes) ;
/****task router****/
//add note
router.route('/task')
    .post(taskController.addTask) ;
//get,delete and update task
router.route('/task/:task_id')
    .get(taskController.getTaskById)
    .put(taskController.updateTask)
    .delete(taskController.deleteTask) ;
//get all notes
router.route('/tasks')
    .get(taskController.getAllTasks) ;


module.exports = router ;