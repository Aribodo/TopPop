var mysql = require('mysql');
var Artist = require('./model/artist');
var con = mysql.createConnection({
host: "localhost",
user: "student",
password: "sponge",
database: "topPop"
});

module.exports = function(){

  return {
    updateDatabase : function (artistArray){
      return new Promise(function (resolve, reject)
      {
     var count = 0;
console.log("Updating");
    artistArray.forEach(function(x)
    {
      console.log("Updating2");
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
searchDatabase: function(name, callBack){

var count = 0;
console.log("searchData" + name);

Artist.findOne ({artist_name: name})
.exec(function (err, user){
  if (err && count == 0) {
    //console.log(err);
    count++;
  }
  else if (!user)
  {
    console.log("empty");
    callBack(user);
  }
  else {
    callBack(user);
  }
})


},
searchDatabaseForCloseMatch: function(name, callBack){
  console.log("search databaseX");


  console.log (name);
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



}


};
}
