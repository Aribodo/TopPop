var express = require('express');
var parser = require('xml2json');
var request = require('request');
var request2 = require('request-promise');
var signature = require('oauth-signature');
var twitter = require('twitter');
var mysql = require('mysql');
var artistsData = require('./artistData');
var datab = require('./database');

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

app.get('/', function(req, res)
{

  artData.billboardTop100()
  .then( function (){
    console.log('HERE 1');
    return artData.loadArtistData()})
    .then(function (result){
      console.log('HERE 2');
      return artData.loadArtistData2(result);
    })
    .then (function (result)
    {
      console.log('HERE 3');
      function compare (a,b)
      {
        if (a.followers < b.followers)
        return 1;
        if (a.followers > b.followers)
        return -1;
        return 0;
      }

      artData.getArtistArray().sort(compare);

      return artData.getBio();

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

  app.get('/profile/:id&:rank', function (req, res){

    res.render('profile', {id : req.params.id,rank : req.params.rank , data:artData.getArtistArray() });
  })

  app.listen(2000);
