var mongoose = require('mongoose')
mongoose.connect('mongodb://ariUmenyiora:Anderson1silva@aritestcluster-shard-00-00-8zrbk.mongodb.net:27017,aritestcluster-shard-00-01-8zrbk.mongodb.net:27017,aritestcluster-shard-00-02-8zrbk.mongodb.net:27017/test?ssl=true&replicaSet=AriTestCluster-shard-0&authSource=admin')

mongoose.connection.once('open', function()
{
  console.log('connection has been made')
}).on ('error', function(err){
  console.log(err);
  console.log('Connection error');

});
