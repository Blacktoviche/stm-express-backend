var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
  title: String,
  description: String,
  status: { type: Number, default: 0 },
  dateCreated: { type: Date, default: Date.now },
  lastModefied: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  projectId: String,
  createdById: String,
  modefiedById:  String,
  comments: [],
  assignedToUsersIds: [],
  project: {},
  statistics: {}
});

TaskSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Task', TaskSchema);