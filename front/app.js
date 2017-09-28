var http = require('http');
var express   =    require("express");
var mysql     =    require('mysql');
var fs = require('fs');
var path = require("path");
var url = require("url");

var portAEcouter = 8080;
var portBdD = 3000;
// Chargement du fichier index.html à afficher au client, ne convient pas pour un fichier html avec css
/*var server = http.createServer(function(req, res) {
    fs.readFile('./pageaccueil.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
   });

server.listen(8080);*/


// gestion du serveur de fichier
function sendError(errCode, errString, response)
{
  response.writeHead(errCode, {"Content-Type": "text/plain"});
  response.write(errString + "\n");
  response.end();
  return;
}

function sendFile(err, file, response)
{
  if(err) return sendError(500, err, response);
  response.writeHead(200);
  response.write(file, "binary");
  response.end();
}

function getFile(exists, response, localpath)
{
  if(!exists) return sendError(404, '404 Not Found', response);
  fs.readFile(localpath, "binary",
   function(err, file){ sendFile(err, file, response);});
}

function getFilename(request, response)
{
  var urlpath = url.parse(request.url).pathname; // following domain or IP and port
  var localpath = path.join(process.cwd(), urlpath); // if we are at root
  fs.exists(localpath, function(result) { getFile(result, response, localpath)});
}

var server = http.createServer(getFilename);
server.listen(portAEcouter);


//Connection à la base de données mysql
var app       =    express();


var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : 'Bum@ce89!!',
    database : 'schema_test',
    debug    :  false
});

function handle_database(req,res) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        connection.query("select * from user",function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }           
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
  });
}

app.get("/",function(req,res){-
        handle_database(req,res);
});

app.listen(portBdD);
