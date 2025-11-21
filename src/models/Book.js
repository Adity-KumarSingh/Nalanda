const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    match: [/^(?:\d{10}|\d{13})$/, 'Please provide a valid ISBN (10 or 13 digits)']
  },
  publicationDate: {
    type: Date,
    required: [true, 'Publication date is required']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    index: true
  },
  totalCopies: {
    type: Number,
    required: [true, 'Number of copies is required'],
    min: [0, 'Total copies cannot be negative']
  },
  availableCopies: {
    type: Number,
    required: true,
    min: [0, 'Available copies cannot be negative']
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

bookSchema.index({ title: 'text', author: 'text', genre: 'text' });

module.exports = mongoose.model('Book', bookSchema);