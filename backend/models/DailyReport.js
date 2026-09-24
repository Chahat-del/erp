const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  tasksCompleted: [
    {
      task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
      description: String
    }
  ],
  workDescription: {
    type: String,
    required: true,
    trim: true
  },
  hoursWorked: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'blocked', 'pending'],
    default: 'in-progress'
  },
  blockers: {
    type: String,
    trim: true,
    default: 'None'
  },
  nextDayPlan: {
    type: String,
    trim: true,
    required: true
  },
  adminReview: {
    reviewed: { type: Boolean, default: false },
    comment: { type: String, default: '' },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  employeeReply: {
    comment: { type: String, default: '' },
    repliedAt: { type: Date }
  }
}, { timestamps: true });

// Ensure one report per employee per day per project
dailyReportSchema.index({ employee: 1, date: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('DailyReport', dailyReportSchema);
