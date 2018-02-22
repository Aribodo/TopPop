  var parser = require('xml2json');
  var request = require('request');
  var request2 = require('request-promise');
  var signature = require('oauth-signature');
  var twitter = require('twitter');
  var help = require('./helper');
  var datab = require('./database');
  var database = datab();
  var client_id = '5080dcbe4ead4467820c37080e368ac9';
  var client_secret = 'bab61c3aacf24556adfb81939c795be5';
  var helper = help();
   var BillBoard = require('billboard-hot-100');




  function Artist(name,picUrl,followers,genre,twitterId)
  {
    this.name = name;
    this.followers = followers;
    this.picUrl = picUrl;
    this.genre = genre;
    this.twitterId = twitterId;
  }


  function removeAtindex(index,data)
  {

    if (index.length!=0)
    {
    var temp = data.slice(0);
    data.length = 0;
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
           data.push(temp[i]);

           }
         }
       }


    }

    }

  }
  function updateArtistArray(size, element)
  {
    console.log("UPDATING ARTIST ARRAY");
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

  function spotifyIdsAlreadyOnDatabase(body,data)
  {
    console.log("SEARCHING DATABASE FOR ARTIST PREVIOUSLY SAVED");
    var removeIndex = [];
    return new Promise(function(resolve, reject)
    {
      var count = 0;
      var spotifyIds = [[],[]];
     console.log("before error");
     //console.log(data);
      data.forEach(function(x,index){

      var token = body.access_token;

      var artistName = helper.removeFeatures(x.artist);

       database.searchDatabase(artistName,function(result){

        count = count + 1;
        if (result.length != 0 )
        {

          if (count<50)
          {
          spotifyIds[0].push(result[0].spotify_artist_id);
          removeIndex.push(index);
           }
           else{
             spotifyIds[1].push(result[0].spotify_artist_id);
             removeIndex.push(index);
           }
        }
        if(count == data.length)
        {
           removeAtindex(removeIndex,data);

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
    console.log("SEARCH SPOTIFY IN BULK");
    if (spotifyIds[0].length == 0)
    {
      return new Promise( function(resolve, reject){
        resolve(1);
      })
    }
    else {
    return new Promise( function(resolve, reject){
    var seperateRequestArtists = [];
    var conjoined = [];
    var count = 0;
    spotifyIds.forEach(function(x)
    {
    var options = {
      url: 'https://api.spotify.com/v1/artists?ids='+ idsAsStrings(x),
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json:true
    };

  request2.get(options).then(function(body){
    count = count + 1;
    seperateRequestArtists.push(body.artists);
    if (count == 2)
    {
    conjoined = seperateRequestArtists[0].concat(seperateRequestArtists[1]);
    resolve(conjoined);
    }
  })
})



  })
  }
  }



  function spotifyIndividualSearch(token,data)
  {
    console.log("SPOTIFY INDIVIDUAL SEARCH ");
    return new Promise(function(resolve, reject)
  {
    var count = 0;
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

       request2.get(options).then(function(body){

         if (body.artists.items.length != 0 && helper.verifyArtistDistinct(body.artists.items[0].name, artistArray)){

           if (body.artists.items[0].name == 'undefined' || body.artists.items[0].images[0] == undefined )
           {
             console.log('error in search');
             //console.log(encodeURI(body.artists.items[0].name));
             //console.log(body.artists);
            resolve(1);
           }
           else{
             count = count + 1;

             artistArray.push(new Artist(body.artists.items[0].name, body.artists.items[0].images[0].url,body.artists.items[0].followers.total, body.artists.items[0].genres[0],body.artists.items[0].id ));
             if(count == count2)
             {
               //console.log("BULK RESOLVED");
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
         if(count == count2)
         {
           //console.log("BULK RESOLVED");
           resolve(1);
         }
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

  })
  }




  module.exports = function()
  {

    return {

      getBio : function(name)
      {
        console.log("GET BIO");
        var url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='  ;
        var bio;
        var count = 0 ;
        return new Promise(function(resolve, reject){

            request2(url + encodeURI(name) + '&indexpageids=' , function(error, response, body) {

              var pageID = JSON.parse(body).query.pageids[0];
              bio = JSON.parse(body).query.pages[pageID].extract;
              resolve(bio);
            })
        });
      },

      billboardTop100 : function(){
        console.log("BILLBOARD 100");
        var data = [];
        return new Promise(function(resolve, reject) {
          /*request2('http://www.billboard.com/rss/charts/hot-100', function(error, response, body) {
            console.log('FETCH BILLBOARD');
            if (error)
            {
              console.log('ERROR IN BILLBOOARD' );
            }
            else{
              var json = parser.toJson(body);

              var jSON = JSON.parse(json);

              var charts = JSON.stringify(jSON.rss.channel.item);

              resolve(data = jSON.rss.channel.item);

            }

          })*/

          BillBoard.init().then(function(billboard){
          var songs = billboard.getAllSongs()
          resolve(songs)
          }).catch(function(err){
          console.log(err)
          })

        });
      },

      loadArtistData : function(data){

        return new Promise(function(resolve, reject){
        /*if(d != undefined && d.length == 1)
        {
          d = [];

          data.push(d);
        } */
        console.log('LOAD ARTIST DATA');
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
        request2(authOptions).then(function(body){

          var count = 0;
          var count2 = data.length;
          var errorCount = 0;
          var token = body.access_token;
          artistArray = [];
          //BULK SEARCH
          spotifyIdsAlreadyOnDatabase(body,data).then(function(ids){

            return spotifyBulkSearch(ids,token)
          }).then(function(element){
            if (element == 1)
            {
              return Promise.resolve(1);
            }
            else
            {
            return updateArtistArray(element.length, element)
            }
          }).then(function(){
         //INDIVIDUAL SEARCH
         return spotifyIndividualSearch(token,data)

       }).then(function(){
           resolve(artistArray);
       })

        });

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
