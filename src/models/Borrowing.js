const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  borrowDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed',
    index: true
  },
  fine: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

borrowingSchema.index({ user: 1, status: 1 });
borrowingSchema.index({ book: 1, status: 1 });
borrowingSchema.pre('save', function(next) {
  if (this.isNew && !this.dueDate) {
    this.dueDate = new Date(this.borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Borrowing', borrowingSchema);