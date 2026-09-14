const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  client: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedEmployees: [
    {
      employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, default: 'member' }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { timestamps: true });

// Auto-generate projectId
projectSchema.pre('save', async function (next) {
  if (!this.projectId) {
    const count = await mongoose.model('Project').countDocuments();
    this.projectId = `PRJ${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
