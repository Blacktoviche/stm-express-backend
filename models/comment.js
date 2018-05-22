var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    commentText: String,
    dateCreated: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    taskId: String,
    createdById: String,
});

CommentSchema.set('toJSON', {
    virtuals: true
  });

module.exports = mongoose.model('Comment', CommentSchema);