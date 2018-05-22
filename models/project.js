var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
    name: String,
    description: String,
    dateCreated: { type: Date, default: Date.now },
    lastModefied: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    createdById: String,
    modefiedById: String,
    tasks: [],
    statistics: {}
});

projectSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Project', projectSchema);