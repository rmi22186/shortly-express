var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var moment = require('moment');

var User = db.Model.extend({
  tableName:'tokens',

  initialize: function(){
    var token = String(Math.random());
    var timeOfExpiration=(new Date() ).getTime() + 30000;

    this.on('creating', function(model, attrs, options){
      model.set('token', token );
      model.set('expiration',timeOfExpiration);
    });
  }
});

module.exports = User;
