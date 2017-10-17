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

    artistArray.forEach(function(x){
   var sql = 'insert into artist (artist_id, artist_name, picture_url,artist_followers,bio,genre) select * from (select null,'+'\''+x.name+'\''+','+'\''+x.picUrl+'\''+','+'\''+x.followers+'\''+','+'\''+x.bio+'\''+','+'\''+x.genre+'\''+') as tmp where not exists (select artist_name from artist  where artist_name = '+'\"' +x.name +'" );'

    con.query(sql, function(err, result)
  {

    if (err)
    {
      //console.log("err");
    }
    else{
    //console.log("result");
  }

  })

  })

  }
};
}
