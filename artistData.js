var parser = require('xml2json');
var request = require('request');
var request2 = require('request-promise');
var signature = require('oauth-signature');
var twitter = require('twitter');
var help = require('./helper');
var data = ['1','2','3'];
var artistArray =[];
var client_id = '5080dcbe4ead4467820c37080e368ac9';
var client_secret = 'bab61c3aacf24556adfb81939c795be5';

var helper = help();

  function Artist(name,picUrl,followers,genre)
{
 this.name = name;
 this.followers = followers;
 this.picUrl = picUrl;
 this.genre = genre;
}

module.exports = function()
{

return {

  getBio : function()
{
  console.log("GET BIO");
var url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='  ;
var bio;
var count = 0 ;
return new Promise(function(resolve, reject){
artistArray.forEach(function(artist)
{

request2(url + encodeURI(artist.name) + '&indexpageids=' , function(error, response, body) {

var pageID = JSON.parse(body).query.pageids[0];
bio = JSON.parse(body).query.pages[pageID].extract;
artist.bio = bio ;
count = count +1;

})
.then(function(){
  if ( count == artistArray.length)
   {
     return resolve(1);
   }

})


})

 });
},

billboardTop100 : function(){
  console.log("BILLBOARD 100");
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
},

loadArtistData : function(){

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

},

loadArtistData2 : function (body){
  console.log("loadArtistData2")
 return new Promise(function(resolve, reject){
   var count = 0;
   var count2 = 100;
   var errorCount = 0;
   artistArray = [];
   data.forEach( function(x) {
   var token = body.access_token;
      var artistName = helper.removeFeatures(x.artist);

      var options = {
     url: 'https://api.spotify.com/v1/search?q='+ encodeURI(artistName)+'&type=artist',
     headers: {
       'Authorization': 'Bearer ' + token
     },
     json:true
      };

      request2.get(options).then(function(body){

              if (helper.verifyArtistDistinct(body.artists.items[0].name, artistArray)){
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
             //console.log(error);
             errorCount = errorCount + 1;
           }
           })
})

});
},


loadInstagramData : function ()
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
},

loadTwitterData : function ()
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
//console.log(body[0]);

});
}
},

getArtistArray : function ()
{
  return artistArray;
},

getData : function ()
{
  return data;
}

}

}
