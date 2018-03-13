var express = require('express');
var parser = require('xml2json');
var request = require('request');
var request2 = require('request-promise');
var signature = require('oauth-signature');
var twitter = require('twitter');
var mysql = require('mysql');
var artistsData = require('./artistData');
var datab = require('./database');
var querystring = require('query-string');
var fs = require('fs');
var app = express();
var database = datab();
var artData = artistsData();
var mongoose = require('mongoose')
const User = require('./model/user')
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose')



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


app.use(session({
  secret: 'topPop',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
  mongooseConnection: mongoDB
  })
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res)
{

  artData.billboardTop100()
  .then( function (data){
    console.log('HERE 1');
    return artData.loadArtistData(data)})
    .then (function (result)
    {
      console.log('HERE 2x');
      //console.log(result);
      function compare (a,b)
      {
        if (a.followers < b.followers)
        return 1;
        if (a.followers > b.followers)
        return -1;
        return 0;
      }
     console.log('HERE 2a');
      artData.getArtistArray().sort(compare);
     console.log('HERE 2b');
      return Promise.resolve(1);

    })
    .then(function (result) {
      console.log('HERE 2c');
      database.updateDatabase(artData.getArtistArray());

      console.log('HERE 4');
      //console.log(req.session);
      res.render('home', {data : artData.getArtistArray() , session : req.session});
    })
    .catch (function (error){
      console.log('finall ERROR');
      console.log('ERROR');
    });

  });

  app.get('/profile/:name', function (req, res){
    var name = req.params.name;
    database.searchDatabase(name.substring(1), function(result){
    artData.getBio(req.params.name).then(function(result2)
    {
      //console.log(result);
      console.log("profile");
      //console.log(name);
     artData.loadTwitterData(name).then(function(result3){
       console.log(result3);
      res.render('profile', {data : result, bio: result2 , twitter : result3, session : req.session});
     });

  });

  });

    ;
  });



  app.get('/userProfile', function (req, res){

    res.render('userProfile', {session : req.session});

  });



  app.get('/search/:name', function (req, res){
    var artistName = req.params.name;
    database.searchDatabaseForCloseMatch(artistName, function(result){
      if (result.length != 0)
      {
        res.render('search', {sArray: result , session : req.session});
      }
      else
      {
        console.log("EMPTY!!")
        var artist = [{artist:artistName}];
        artData.loadArtistData(artist)
        .then(function(){
          database.updateDatabase(artData.getArtistArray()).then(function(result)
          {
            console.log("get array")
            console.log(artData.getArtistArray());
            database.searchDatabaseForCloseMatch(artistName, function(result2)
          {
            if (result2.length != 0)
            {
              console.log("FOUNDISH");
            res.render('search', {sArray: result2 , session : req.session});
            }
          });
        });

      });
      }
    });


  });


  app.get('/rank', function(req, res)
  {

    artData.billboardTop100()
    .then( function (data){
      console.log('HERE 1');
      return artData.loadArtistData(data)})
      .then (function (result)
      {

        console.log('HERE 2x');
        //console.log(result);
        function compare (a,b)
        {
          if (a.followers < b.followers)
          return 1;
          if (a.followers > b.followers)
          return -1;
          return 0;
        }
       console.log('HERE 2.2');
        artData.getArtistArray().sort(compare);

        return Promise.resolve(1);

      })
      .then(function (result) {
        console.log('HERE 3');
        database.updateDatabase(artData.getArtistArray());
        //artData.loadTwitterData();
        console.log('HERE 4');
        //res.writehead(200, {'Content-Type': 'application/json'});
        var myObj = {
          name: "Dog"
        };
        res.send( artData.getArtistArray() );
      })
      .catch (function (error){
        console.log('finall ERROR');
        console.log('ERROR');
      });

    });


    app.get('/logout', function (req, res, next) {
  if (req.session) {
    console.log("end sessionXXXXX11");
    req.session.destroy(function (err) {
      if (err) {
        console.log("end session11");
        return next(err);
      } else {

        console.log("end session");
        return res.redirect('/');
      }
    });
  }
});


    app.post('/auth', function (req, res, next) {
  console.log("password check");
  if (req.body.password !== req.body.passwordConf) {
    console.log("password check2");
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {
     console.log("password check2");
    var userData =  {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }
    console.log(userData);
    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        req.session.userName = userData.username;
        req.session.signedIn = true;
        return res.redirect('/userProfile');
      }
    });


  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {

        req.session.userId = user._id;
        req.session.userName = user.username;
        req.session.signedIn = true;
        return res.redirect('/userProfile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});
app.get('/auth', function(req, res)
{
 res.render('auth', {session : req.session});
});

app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});



  app.listen(2000);
