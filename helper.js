module.exports = function ()
{

  return {

    removeFeatures : function(string)
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

    },

    verifyArtistDistinct : function(name, artistArray)
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
    },

    createRandomString : function(){
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 41; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;

    },

    compare : function(a,b)
    {
      if (a.followers < b.followers)
      return 1;
      if (a.followers > b.followers)
      return -1;
      return 0;
    },
    timeStamp : function(){
      var d = new Date();
      var seconds = Math.round(d.getTime() / 1000);
      return seconds;
    }

  }

}
