var express = require('express');
var router = express.Router();
var artistsData = require('./artistData');
var artData = artistsData();
const User = require('./model/user');
var datab = require('./database');
var database = datab();



router.get('/', function(req, res)
{
  artData.billboardTop100()
  .then( function (data){
    console.log('LAUNCH STEP : (LOAD ARTIST BILLBOARD DATA)');
    return artData.loadArtistData(data)})
  .then( function (result){
      function compare (a,b)
      {
        if (a.followers < b.followers)
        return 1;
        if (a.followers > b.followers)
        return -1;
        return 0;
      }
      artData.getArtistArray().sort(compare);
      return Promise.resolve(1);

    })
  .then(function (result){
      database.updateDatabase(artData.getArtistArray());
      console.log('LAUNCH STEP : (UPDATE DATABASE)');
      res.render('home', {data : artData.getArtistArray() , session : req.session});
    })
  .catch(function (error){
      console.log('finall ERROR');

    });

  });

//renders artist profiles
  router.get('/profile/:name', function (req, res){
    console.log('GET ARTIST PROFILE');
    var name = req.params.name;
    var bioData ;
    var youtubeData ;
    var twitterD ;
    database.searchDatabase(name.substring(1), function(artistData){
      artData.getBio(req.params.name)
      .then(function(bio){
      bioData = bio;
      return artData.loadYoutubeData(name);
      })
      .then(function(youtube){
      youtubeData = youtube;
      return artData.loadTwitterData(name);
      })
      .then(function(twitter){
      twitterData = twitter;
      return artData.storeGoogle();
      })
      .then(function(){
        User.authenticate(req.session.logmail, req.session.logpassword, function (error, user) {
          if (error || !user) {
           console.log("no user");
           res.render('profile', {data : artistData, bio: bioData , twitter : twitterData, youtube : youtubeData , session : req.session});
          } else {
            req.session.userId = user._id;
            req.session.userName = user.username;
            req.session.signedIn = true;
            req.session.myArtists = user.myArtists;
            req.session.save(function(){console.log("session saved")});
            res.render('profile', {data : artistData, bio: bioData , twitter : twitterData, youtube : youtubeData , session : req.session});
          }});
      });

  });


  });


 //renders user profile page
  router.get('/userProfile', function (req, res){

    User.authenticate(req.session.logmail, req.session.logpassword, function (error, user) {
      if (error || !user) {
        database.searchDatabaseBulk(req.session.myArtists, function(result){
        res.render('userProfile', {session : req.session, data : result});
        })
  } else {
    req.session.userId = user._id;
    req.session.userName = user.username;
    req.session.signedIn = true;
    req.session.myArtists = user.myArtists;
    database.searchDatabaseBulk(req.session.myArtists, function(result){
    res.render('userProfile', {session : req.session, data : result});
    })


  }})

  });


  // handles user search queries
  router.get('/search/:name', function (req, res){
    console.log('SEARCH ARTIST');
    var artistName = req.params.name;
    database.searchDatabaseForCloseMatch(artistName, function(result){
      if (result.length != 0)
      {
        res.render('search', {sArray: result , session : req.session});
      }
      else
      {
        var artist = [{artist:artistName}];
        artData.loadArtistData(artist)
        .then(function(){

        return database.updateDatabase(artData.getArtistArray());

        })
        .then(function(){
          database.searchDatabaseForCloseMatch(artistName, function(result2)
         {
          if (result2.length != 0)
          {
          res.render('search', {sArray: result2 , session : req.session});
          }
         });
        });
      }
    });


  });

  // API returns the days top artists in JSON
  router.get('/rank', function(req, res)
  {
    artData.billboardTop100()
    .then( function (data){
      return artData.loadArtistData(data)})
      .then (function (result)
      {
        function compare (a,b)
        {
          if (a.followers < b.followers)
          return 1;
          if (a.followers > b.followers)
          return -1;
          return 0;
        }
        artData.getArtistArray().sort(compare);
        return Promise.resolve(1);
      })
      .then(function (result) {
        database.updateDatabase(artData.getArtistArray());
        res.send( artData.getArtistArray() );
      })
      .catch (function (error){
        console.log('finall ERROR');
      });

    });

  // handles logout and memory management
    router.get('/logout', function (req, res, next) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

  //Handles user log in and registration from autherization page
    router.post('/auth', function (req, res, next) {
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {
    var userData =  {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
      myArtists : [],
    }
    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.logmail = req.body.email;
        req.session.logpassword = req.body.password;
        req.session.userId = user._id;
        req.session.userName = userData.username;
        req.session.signedIn = true;
        req.session.myArtists = userData.myArtists ;
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
        req.session.logmail = req.body.logemail;
        req.session.logpassword = req.body.logpassword;
        req.session.userId = user._id;
        req.session.userName = user.username;
        req.session.signedIn = true;
        req.session.myArtists = user.myArtists;
        return res.redirect('/userProfile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

//renders autherization page
router.get('/auth', function(req, res)
{
 res.render('auth', {session : req.session});
});

module.exports = router;
