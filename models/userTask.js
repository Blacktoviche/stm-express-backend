var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserTaskSchema = new Schema({
    taskId: String,
    userId: String,
});

UserTaskSchema.set('toJSON', {
    virtuals: true
  });

module.exports = mongoose.model('UserTask', UserTaskSchema);