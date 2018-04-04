var express = require('express');
var datab = require('./database');
var querystring = require('query-string');
var fs = require('fs');
var app = express();
var database = datab();
var mongoose = require('mongoose')
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./routes')


/*
var con = mysql.createConnection({
  host: "localhost",
  user: "student",
  password: "sponge",
  database: "topPop"
});
*/

mongoose.connect('mongodb://ariUmenyiora:Anderson1silva@aritestcluster-shard-00-00-8zrbk.mongodb.net:27017,aritestcluster-shard-00-01-8zrbk.mongodb.net:27017,aritestcluster-shard-00-02-8zrbk.mongodb.net:27017/test?ssl=true&replicaSet=AriTestCluster-shard-0&authSource=admin')

var mongoDB = mongoose.connection.once('open', function()
{
  console.log('connection has been made')
}).on ('error', function(error){
  console.log('Connection error')
});

function Artist(name,picUrl,followers,genre)
{
  this.name = name;
  this.followers = followers;
  this.picUrl = picUrl;
  this.genre = genre;
}


/*function updateDatabase()
{
  console.log("Conne!");
  artistArray.forEach(function(x){
    var sql = 'insert into artist (artist_id, artist_name, picture_url,artist_followers,bio) select * from (select null,'+'\''+x.name+'\''+','+'\''+x.picUrl+'\''+','+'\''+x.followers+'\''+','+'\''+x.bio+'\'' +') as tmp where not exists (select artist_name from artist  where artist_name = '+'\"' +x.name +'" );'
    con.query(sql, function(err, result)
    {
      if (err) throw err;
      //console.log(result);
    })
  })
}*/

app.set('view engine' , 'ejs');
app.use(express.static('public'));
app.use(express.static('views'));

app.use(session({
  secret: 'topPop',
  resave: true,
  saveUninitialized: true,
  rolling: true,
  store: new MongoStore({
  mongooseConnection: mongoDB
  })
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//handles socket connection
io.on('connection', function(socket){
  socket.on('artistTog', function(status){
    database.updateUserArtistList(status.Uname,status.Aname)
  });
});

app.use('/', routes);

app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


//server is listening
http.listen(2000, function(){
console.log('listening on *:3000');
});
