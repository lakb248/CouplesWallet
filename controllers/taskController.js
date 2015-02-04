/**
 * Created by Administrator on 2015/2/3.
 */
var Task = require('../models/task') ;
//add task
exports.addTask = function(req,res){
    var title = req.body.title,
        content = req.body.content,
        date = req.body.date,
        duration = req.body.duration,
        frequency = req.body.frequency ;

    Task.addTask(title,content,date,duration,frequency,
        function(task){
            res.json({'status':1,'task':task}) ;
        },function(object,error){
            res.json({'status':0,'message':error}) ;
        }) ;
} ;
//update task
exports.updateTask = function(req,res){
    var id = req.params.task_id,
        title = req.body.title,
        content = req.body.content,
        date = req.body.date,
        duration = req.body.duration,
        frequency = req.body.frequency ;
    Task.updateTask(id,title,content,date,duration,frequency,
        function(task){
            res.json({'status':1,'task':task}) ;
        },function(object,error){
            res.json({'status':0,'message':error}) ;
        }) ;
} ;
//get all tasks
exports.getAllTasks = function(req,res){
    Task.findAll(function(tasks){
        res.json({'status':1,'tasks':tasks}) ;
    },function(object,error){
        res.json({'status':0,'message':error}) ;
    }) ;
} ;
//get task by id
exports.getTaskById = function(req,res){
    var id = req.params.task_id ;
    Task.findById(id,function(task){
        res.json({'status':1,'task':task}) ;
    },function(object,error){
        res.json({'status':0,'message':error}) ;
    }) ;
} ;
//delete task by id
exports.deleteTask = function(req,res){
    var id = req.params.task_id ;
    Task.delete(id,function(task){
        res.json({'status':1,'task':task}) ;
    },function(object,error){
        res.json({'status':0,'message':error}) ;
    }) ;
} ;