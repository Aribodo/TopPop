var mysql = require('mysql');
var con = mysql.createConnection({
host: "localhost",
user: "student",
password: "sponge",
database: "topPop"
});

module.exports = function(){

  return {
    updateDatabase : function (artistArray){
     var count = 0;
    artistArray.forEach(function(x){

   var sql = 'insert into artist (artist_id, artist_name, picture_url,artist_followers,genre,spotify_artist_id) select * from (select null,'+'\''+x.name+'\''+','+'\''+x.picUrl+'\''+','+'\''+x.followers+'\''+','+'\''+x.genre+'\''+','+'\''+x.twitterId+'\''+') as tmp where not exists (select artist_name from artist  where artist_name = '+'\"' +x.name +'" );'

    con.query(sql, function(err, result)
  {

    if (err && count==0)
    {
      console.log(err);
      count++;
    }
    else{
    //console.log("result");
  }

  })

  })

},
searchDatabase: function(name, callBack){
  
var sql = 'select* from artist where artist_name ='+'\''+name+'\';'
//console.log("searchData");
con.query(sql, function(err, result2)
{

if (err && count==0)
{
  console.log(err);
  count++;
}
else if (result2.length == 0)
{
  result = result2;
  callBack(result);
  //console.log("BAD QUERY");

}
else{
  result = result2;
  callBack(result);
//console.log(result);

}

})


}

};
}
