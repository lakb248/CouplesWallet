/**
 * Task = {
 *      title : string ,
 *      content : string ,
 *      date : int ,
 *      duration : int ,
 *      frequency : int ,
 *      done : array
 * }
 *
 *
 */

var avos = require('../models/avos') ;
var Task = avos.Object.extend('Task') ;

//add task
exports.addTask = function(title,content,date,duration,
                           frequency,done,success,error){
    var query = new avos.Query(Task) ;
    var task = new Task() ;
    task.set('title',title) ;
    task.set('content',content) ;
    task.set('date',date) ;
    task.set('duration',duration) ;
    task.set('frequency',frequency) ;
    task.set('done',done) ;
    task.save(null,{
        success : success ,
        error : error
    }) ;
} ;
//update task
exports.updateTask = function(id,title,content,date,duration,
                              frequency,done,success,error){
    var query = new avos.Query(Task) ;
    query.get(id,{
        success : function(task){
            task.set('title',title) ;
            task.set('content',content) ;
            task.set('date',date) ;
            task.set('duration',duration) ;
            task.set('frequency',frequency) ;
            task.set('done',done) ;
            task.save(null,{
                success : success ,
                error : error
            }) ;
        },
        error : error
    })
} ;
//find task by id
exports.findById = function(id,success,error){
    var query = new avos.Query(Task) ;
    query.get(id,{
        success : success ,
        error : error
    }) ;
} ;
//find all tasks
exports.findAll = function(success,error){
    var query = new avos.Query(Task) ;
    query.descending('date') ;
    query.find({
        success : success ,
        error : error
    }) ;
} ;
//delete task
exports.delete = function(id,success,error){
    var query = new avos.Query(Task) ;
    query.get(id,{
        success : function(task){
            task.destroy({
                success : success ,
                error : error
            }) ;
        } ,
        error : error
    }) ;
} ;