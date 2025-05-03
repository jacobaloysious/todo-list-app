const mongoose = require('mongoose');
const Project = require('./Project');

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  date: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save middleware to validate project reference
todoSchema.pre('save', async function(next) {
  if (this.project) {
    const project = await Project.findById(this.project);
    if (!project) {
      throw new Error('Invalid project reference');
    }
  }
  next();
});

module.exports = mongoose.model('Todo', todoSchema);
