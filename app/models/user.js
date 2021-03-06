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
          model.set('password', res);
          model.save();
        });
      });
    });
  }
});

module.exports = User;
