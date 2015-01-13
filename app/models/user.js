var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName:'users',
  initialize: function(){
    this.on('add', function(model, attrs, options){
      bcrypt.genSalt(10, function(error, result) {
        model.set('salt', result);
        bcrypt.hash(model.get('password'), result, null, function(error, res) {
          console.log('password pre salting' + model.get('password'));
          console.log('salt pre saving (undefined)' + model.get('salt'));
          model.set('password', res);
          console.log('password post salting' + model.get('password'));
          model.save();
          console.log('salt post saving (SALT PLEASE)' + model.get('salt'));
        });
      });
    });
  }
});

module.exports = User;
