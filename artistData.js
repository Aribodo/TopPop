var parser = require('xml2json');
var request = require('request');
var request2 = require('request-promise');
var signature = require('oauth-signature');
var twitter = require('twitter');
var help = require('./helper');
var datab = require('./database');
var database = datab();

var data = ['1','2','3'];
var artistArray =[];
var client_id = '5080dcbe4ead4467820c37080e368ac9';
var client_secret = 'bab61c3aacf24556adfb81939c795be5';

var helper = help();




function Artist(name,picUrl,followers,genre,twitterId)
{
  this.name = name;
  this.followers = followers;
  this.picUrl = picUrl;
  this.genre = genre;
  this.twitterId = twitterId;
}


function removeAtindex(index)
{
  console.log("remove at index");
  var temp = data;
  var newArray = [];
  for(var i = 0; i < temp.length; i++ )
  {
     for(var x = 0; x < index.length; x++)
     {
       if (i == index[x])
       {
          break;
       }
       else{
         if (x == index.length - 1)
         {
         newArray.push(temp[i]);

         }
       }
     }


  }
    data = newArray;

}
function updateArtistArray(size, element)
{
  console.log("update artist Array");
  var count = 0;
  return new Promise(function(resolve,reject)
  {
  if (size <= 1)
  {

    if(size != 0)
    {
    artistArray.push(new Artist(element[i].name, element[i].items[0].url,element[i].followers.total, element[i].genres[0],element[i].id));
    resolve(1);
    }
  }
  else {
    for(var i = 0; i < size; i++)
    {

      if((artistArray.length!= 0 && helper.verifyArtistDistinct(element[i].name, artistArray)) || artistArray.length == 0)
      {
        count = count + 1;
      var artist = new Artist(element[i].name, element[i].images[0].url,element[i].followers.total, element[i].genres[0],element[i].id);
      artistArray.push(artist);
      }
    }

    resolve(1);
  }
})
}

function spotifyIdsAlreadyOnDatabase(body)
{
  console.log("check for artist already in database");
  var removeIndex = [];
  return new Promise(function(resolve, reject)
  {
    var count = 0;
    var spotifyIds = [];
  data.forEach(function(x,index){
    var token = body.access_token;
    var artistName = helper.removeFeatures(x.artist);
     database.searchDatabase(artistName,function(result){
      count = count + 1;
      if (result.length != 0 )
      {
        if (count<50)
        {
        spotifyIds.push(result[0].spotify_artist_id);
        removeIndex.push(index);
         }
      }
      if(count == data.length)
      {
        removeAtindex(removeIndex);
         resolve(spotifyIds);
      }
    });
  })
})
}

function idsAsStrings(idsArray){

  var string = '';

  for(var i = 0; i<idsArray.length; i++)
  {
    if(i == idsArray.length-1)
    {
    string += idsArray[i];
  }
  else {
    string += idsArray[i]+',';
  }
}
return string;
}


function spotifyBulkSearch(spotifyIds,token){
  console.log("Bulk search spotify for artists");
  if (spotifyIds.length == 0)
  {
    return new Promise( function(resolve, reject){
      resolve(1);
    })
  }
  else {
  return new Promise( function(resolve, reject){
  var options = {
    url: 'https://api.spotify.com/v1/artists?ids='+ idsAsStrings(spotifyIds),
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json:true
  };

request2.get(options).then(function(body){
  resolve(body);
})

})
}
}



function spotifyIndividualSearch(token, count)
{
  console.log("spotify individual search");
  return new Promise(function(resolve, reject)
{
  var errorCount = 0;
  count2 = data.length;
   data.forEach(function(x) {
     var artistName = helper.removeFeatures(x.artist);
     var options = {
       url: 'https://api.spotify.com/v1/search?q='+ encodeURI(artistName)+'&type=artist',
       headers: {
         'Authorization': 'Bearer ' + token
       },
       json:true
     };
     console.log("spotify individual request");
     request2.get(options).then(function(body){
       if (body.artists.items.length != 0 && helper.verifyArtistDistinct(body.artists.items[0].name, artistArray)){

         if (body.artists.items[0].name == 'undefined' || body.artists.items[0].images[0].url == 'undefined' )
         {
           console.log('error in search');
         }
         else{
           count = count + 1;
           artistArray.push(new Artist(body.artists.items[0].name, body.artists.items[0].images[0].url,body.artists.items[0].followers.total, body.artists.items[0].genres[0],body.artists.items[0].id ));
           if(count == count2)
           {
             console.log("BULK RESOLVED");
             resolve(1);
           }
         }
       }
       else {
         count2 = count2 - 1;
         if (body.artists.items[0] == undefined)
         {
           /*console.log("unfound")
           console.log(body.artists)
           console.log("\n")
           console.log("\n")*/
         }
         else{
         /*console.log("ubiquitous")
         console.log(body.artists.items[0])
         console.log("\n")
         console.log("\n")*/
       }
       }

     })
     .catch(function(error)
     {
     console.log("spotify individual search error")
       if (errorCount == 0){
         console.log(error);
         errorCount = errorCount + 1;
       }
     })
   })

})
}




module.exports = function()
{

  return {

    getBio : function()
    {
      //console.log("GET BIO");
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
        var count2 = data.length;
        var errorCount = 0;
        var token = body.access_token;
        artistArray = [];
        //BULK SEARCH
        spotifyIdsAlreadyOnDatabase(body).then(function(ids){
          return spotifyBulkSearch(ids,token)
        }).then(function(element){
          if (element == 1)
          {
            return Promise.resolve(1);
          }
          else
          {
          return updateArtistArray(element.artists.length, element.artists)
          }
        }).then(function(){
       //INDIVIDUAL SEARCH
       return spotifyIndividualSearch(token, count)

     }).then(function(){
         resolve(1);
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
    artistArray.forEach(function (entry)
    {
      client.get('users/search',{q: entry.name+ '&filter:verified' , count: 2}, function(error, body, response) {
        console.log('TWITTER '  + body[0].screen_nam);

      });
    })
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
