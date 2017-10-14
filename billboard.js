var express = require('express');
var parser = require('xml2json');
var request = require('request');
var request2 = require('request-promise');
var signature = require('oauth-signature');
var twitter = require('twitter');
var mysql = require('mysql');

var fs = require('fs');
var app = express();
var client_id = '5080dcbe4ead4467820c37080e368ac9';
var client_secret = 'bab61c3aacf24556adfb81939c795be5';
var artistArray =[];
var data = ['1','2','3'];

function createRandomString(){
  var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 41; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

}

var con = mysql.createConnection({
  host: "localhost",
  user: "student",
  password: "sponge",
  database: "topPop"
});


function verifyArtistDistinct(name)
{

if (artistArray.length > 0)
{

  for (var i = 0; i < artistArray.length; i++)
  {
    //console.log(name + ' VS ' + artistArray[i].name + ' index '+ i);
    if (name == artistArray[i].name)
    {

      return false;
    }
  }

  return true;
}

  return true;
}

function Artist(name,picUrl,followers,genre)
{
 this.name = name;
 this.followers = followers;
 this.picUrl = picUrl;
 this.genre = genre;
}


function timeStamp(){
  var d = new Date();
var seconds = Math.round(d.getTime() / 1000);
return seconds;
}




function removeFeatures (string)
{
  var featureIndex = string.search("Featur");
  var featureIndex2 = string.search("\\+");

  if (featureIndex == -1 && featureIndex2 == -1)
  {
    return string;
  }
  else {
    if (featureIndex != -1){
    return string.substring(0,featureIndex-1);
  }
  else{
    return string.substring(0,featureIndex2-1);
  }
  }

}

  function loadInstagramData()
  {

    var artistName = 'Russ';
    var token = '1706596900.c664ee9.e3a7a537088845c3835d6a162842558d';
    var options = { url: 'https://api.instagram.com/v1/users/search?q='+ 'umenyiora' + '&access_token='+ token,
    headers: {
        'Authorization': 'Bearer ' + token
      },
      json:true
  };
  request2.get(options)
  .then(function(body){

  })
  .catch(function(err) {
    console.log('INSTAGRAM ERROR')
  })
  }

  function loadTwitterData()
  {

    console.log('TWITTER.2');
  var client = new twitter ({

    consumer_key: 'KzxS6GCGbJEnhx6hpcAOEaWKl',
    consumer_secret:'cKYfVku24KdfPGy4r8OoI2uW8rYIK4SzzV3eklPyCLko5n3Kgd',
    access_token_key:'717857757353869312-BilwpyEt78izbMtLKMqxY7RLsfar0gR',
    access_token_secret: 'fi2PfqIimcs7TWZnMI5cmIwqvlYpY1YDYZRSREHF1Qse4'
  });
 console.log(artistArray.length);
  for(var i = 0; i < 3; i++)
  {
  client.get('users/search',{q: artistArray[i].name , count: 3}, function(error, body, response) {
  console.log('TWITTER' + artistArray[i].name);
  console.log(body[0]);

  });
}
  }


function billboardTop100 (){
 data = [];
  return Promise.resolve(
 request2('http://www.billboard.com/rss/charts/hot-100', function(error, response, body) {
console.log('FETCH BILLBOARD');
  if (error)
  {
    console.log('ERROR IN BILLBOOARD' );
  }
  else{
  var json = parser.toJson(body);

  var jSON = JSON.parse(json);

  var charts = JSON.stringify(jSON.rss.channel.item);

   data = jSON.rss.channel.item;
}

})
)
}


function updateDatabase()
{

console.log("Conne!");

  artistArray.forEach(function(x){
 var sql = 'insert into artist (artist_id, artist_name, picture_url,artist_followers) select * from (select null,'+'\''+x.name+'\''+','+'\''+x.picUrl+'\''+','+'\''+x.followers+'\''+') as tmp where not exists (select artist_name from artist  where artist_name = '+'\"' +x.name +'" );'

  con.query(sql, function(err, result)
{
  if (err) throw err;
  console.log(result);
})
})

}

function loadArtistData2(body){
 return new Promise(function(resolve, reject){
   var count = 0;
   var count2 = 100;
   var errorCount = 0;
   artistArray = [];
 data.forEach( function(x) {
   var token = body.access_token;
      var artistName = removeFeatures(x.artist);

      var options = {
     url: 'https://api.spotify.com/v1/search?q='+ encodeURI(artistName)+'&type=artist',
     headers: {
       'Authorization': 'Bearer ' + token
     },
     json:true
      };

      request2.get(options).then(function(body){

              if (verifyArtistDistinct(body.artists.items[0].name)){
              //console.log('loadArtistData 3');
              if (body.artists.items[0].name == 'undefined' || body.artists.items[0].images[0].url == 'undefined' )
              {
                console.log('error in search');
              }
              else{
                count = count + 1;

              artistArray.push(new Artist(body.artists.items[0].name, body.artists.items[0].images[0].url,body.artists.items[0].followers.total, body.artists.items[0].genres[0]));
                if(count == count2)
                {
                  resolve(1);
                }
                  }
              }
              else {
                count2 = count2 - 1;
              }

             })
             .catch(function(error)
           {
             if (errorCount == 0){
             console.log(error);
             errorCount = errorCount + 1;
           }
           })
})

});
}




function loadArtistData(){

console.log('loadArtistData');
var authOptions = {
  method:'POST',
url: 'https://accounts.spotify.com/api/token',
headers: {
   'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
},
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};
  return request2(authOptions);

}


app.set('view engine' , 'ejs');

app.get('/', function(req, res)
{
  billboardTop100()
  .then( function (){

    return loadArtistData()})
  .then(function (result){
   return loadArtistData2(result);
 })
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

  artistArray.sort(compare);
})
  .then(function (result) {
    updateDatabase();
    res.render('home', {data : artistArray});
  })
  .catch (function (error){
    console.log('finall ERROR');
    console.log('ERROR');
  });



});

app.get('/profile/:id&:rank', function (req, res){

res.render('profile', {id : req.params.id,rank : req.params.rank , data:artistArray });
})

app.listen(2000);
