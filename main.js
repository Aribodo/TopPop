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


/*
var con = mysql.createConnection({
  host: "localhost",
  user: "student",
  password: "sponge",
  database: "topPop"
});
*/


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
app.get('/', function(req, res)
{

  artData.billboardTop100()
  .then( function (data){
    console.log('HERE 1');
    return artData.loadArtistData(data)})
    .then (function (result)
    {
      console.log('HERE 2');
      //console.log(result);
      function compare (a,b)
      {
        if (a.followers < b.followers)
        return 1;
        if (a.followers > b.followers)
        return -1;
        return 0;
      }
     console.log('HERE 2');
      artData.getArtistArray().sort(compare);

      return Promise.resolve(1);

    })
    .then(function (result) {
      database.updateDatabase(artData.getArtistArray());
      //artData.loadTwitterData();
      console.log('HERE 4');
      res.render('home', {data : artData.getArtistArray()});
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
    res.render('profile', {data : result[0], bio: result2});
  });

  });

    ;
  });


  app.get('/search/:name', function (req, res){
    var artistName = req.params.name;
    database.searchDatabaseForCloseMatch(artistName, function(result){
      if (result.length != 0)
      {
        res.render('search', {sArray: result});
      }
      else
      {
        console.log("EMPTY!!")
        var artist = [{artist:artistName}];
        artData.loadArtistData(artist)
        .then(function(){
          database.updateDatabase(artData.getArtistArray());
          console.log("get array")
          console.log(artData.getArtistArray());
          database.searchDatabaseForCloseMatch(artistName, function(result2)
        {
          if (result2.length != 0)
          {
          res.render('search', {sArray: result2});
          }
        });
      });
      }
    });


  });

  app.listen(2000);
