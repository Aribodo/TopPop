var mysql = require('mysql');
var Artist = require('./model/artist');
var User = require('./model/user');
var con = mysql.createConnection({
host: "localhost",
user: "student",
password: "sponge",
database: "topPop"
});

module.exports = function(){

  return {
    //updates database with new artist
    updateDatabase : function (artistArray){
      return new Promise(function (resolve, reject)
      {
     var count = 0;
     console.log("Updating");
    artistArray.forEach(function(x)
    {
      var artistData =  {
        artist_name: x.name,
        picture_url: x.picUrl,
        artist_followers: x.followers,
        genre: x.genre,
        spotify_artist_id: x.twitterId,
      }


      Artist.create (artistData, function(error, user){
        if(error && count == 0) {
           //console.log(error);
        }
        else {
          console.log("Datababse updated");
          resolve(1);
        }
      })

    }
  ) })

},
//seaches database for artist by name
searchDatabase: function(name, callBack){
var count = 0;
Artist.findOne ({artist_name: name})
.exec(function (err, user){
  if (err && count == 0) {
    //console.log(err);
    count++;
  }
  else if (!user)
  {
    callBack(user);
  }
  else {
    callBack(user);
  }
})


},
//search database in bulk given array of names
searchDatabaseBulk: function(nameArray, callBack){
var count = 0;
Artist.find({artist_name: {$in : nameArray}})
.exec(function (err, docs){
  if (err && count == 0) {
    //console.log(err);
    count++;
  }
  else if (!docs)
  {
    callBack(docs);
  }
  else {
    callBack(docs);
  }
})


}
,
// search database for close match
searchDatabaseForCloseMatch: function(name, callBack){
  console.log("search databaseX");
  var count = 0;
  Artist.find({ artist_name : { $regex :  name  , $options: 'i'} }, function (error, result)
{
if (error && count == 0)
{
  //console.log(error);
  count++;
}
else if (result.length == 0)
{
  //console.log(result);
  callBack(result);
}
else {
  console.log("HERE!");
  //console.log(result);
  callBack(result);
}
});
},
//adds artist name to users list
updateUserArtistList: function(userName,artistName)
{
 console.log(userName);
console.log(artistName);
  User.findOne ({username: userName})
  .exec(function (err, user){
    if (err && count == 0) {
      console.log(err);
      count++;
    }
    else if (!user)
    {

    }
    else {
      console.log("USER");
      function isName(x){
        return x == artistName
      };
      console.log(user.myArtists.find(isName));
      if (user.myArtists.find(isName) == null)
      {
        console.log("YERR");
        user.myArtists.push(artistName);
        var list = user.myArtists;
        console.log(user.myArtists)
        User.findOneAndUpdate({username: userName}, {myArtists : list}, function(err, doc){ console.log(doc);});
      }
      else {
        console.log("BERR");
        var index = user.myArtists.indexOf(artistName);
        user.myArtists.splice(index,1);
        var list = user.myArtists;
        console.log(list);
        User.findOneAndUpdate({username: userName}, {myArtists : list}, function(err, doc){ console.log(doc);});
      }

    }
  })

}


};
}
