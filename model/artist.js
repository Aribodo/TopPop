const mongoose = require('mongoose')
var bcrypt = require('bcrypt');
const Schema = mongoose.Schema

const ArtistSchema = new Schema({
  artist_name: {
    type: String,
    unique: true,
    trim: Boolean
  },
  picture_url: {
    type: String
  },
  artist_followers: {
    type: Number
  },
  bio: {
    type: String
  },
  genre: {
    type: String,
    trim: Boolean
  },
  spotify_artist_id: {
    type: String,
    unique: true
  }
});




var Artist = mongoose.model('artist', ArtistSchema);
module.exports = Artist;
