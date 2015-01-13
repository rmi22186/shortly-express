var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName:'users',
  initialize: function(){
    var salt=String(Math.random());

    this.on('creating', function(model, attrs, options){
      //shasum.update(model.get('users'));
      //model.set('code', shasum.digest('hex').slice(0, 5));

      model.set('salt', salt );
      /*
      salt:bcrypt.genSalt(10,function(error,result){
    if (error){console.log(error);}
      return  result;
      })
      */
    });
  }

});

module.exports = User;
