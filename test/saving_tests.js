const mocha = require('mocha');
const assert = require('assert')
const User = require('../model/user')

describe('saving tests', function(){

  it('saving', function()
{
  var nUser = new User (
    {
  email: 'AriY@gmail.com',
  username: 'AriY',
  password: 'Sponge2',
  passwordConf: 'Sponge2'
}
  );

  nUser.save().then(function(done){

  assert(nUser.isNew === false);
    done();
  })
});

})
