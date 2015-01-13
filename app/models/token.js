var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var moment = require('moment');

var User = db.Model.extend({
  tableName:'token',

  initialize: function(){
    var token = String(Math.random());
    var timeOfExpiration=moment().add(30,'seconds');

    this.on('creating', function(model, attrs, options){
      model.set('token', token );
      model.set('timestamp',timeOfExpiration);
    });
  }
});

module.exports = User;
