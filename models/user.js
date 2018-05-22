var mongoose = require('mongoose');
var UserTask = require('./userTask');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  password: String,
  firstname: {type: String, default: ''},
  lastname: {type: String, default: ''},
  email: {type: String, default: ''},
  beautifyRoleName: { type: String,
    enum: ['Admin', 'User']
  },
  token: String,
  enabled: Boolean
});

UserSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('User', UserSchema);