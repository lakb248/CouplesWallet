var express = require('express') ;
var mongoose = require('mongoose') ;
var bodyParser = require('body-parser') ;
var app = express() ;


app.use(express.static(__dirname + '/public')) ;
app.use(bodyParser.json()) ;

app.listen(8080) ;
