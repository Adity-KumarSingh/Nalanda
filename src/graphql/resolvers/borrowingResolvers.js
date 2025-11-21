const Borrowing = require('../../models/Borrowing');
const Book = require('../../models/Book');
const { BORROWING_STATUS } = require('../../config/constants');

const borrowingResolvers = {
  borrowBook: async ({ bookId }, context) => {
    if (!context.user) {
      throw new Error('Authentication required');
    }

    const userId = context.user._id;

    const book = await Book.findOne({ _id: bookId, isActive: true });

    if (!book) {
      throw new Error('Book not found');
    }

    if (book.availableCopies <= 0) {
      throw new Error('Book is not available for borrowing');
    }

    const existingBorrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: BORROWING_STATUS.BORROWED
    });

    if (existingBorrowing) {
      throw new Error('You have already borrowed this book');
    }

    const borrowing = await Borrowing.create({
      user: userId,
      book: bookId,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    book.availableCopies -= 1;
    await book.save();

    await borrowing.populate(['user', 'book']);

    return borrowing;
  },

  returnBook: async ({ borrowingId }, context) => {
    if (!context.user) {
      throw new Error('Authentication required');
    }

    const userId = context.user._id;

    const borrowing = await Borrowing.findOne({
      _id: borrowingId,
      user: userId,
      status: BORROWING_STATUS.BORROWED
    }).populate('book');

    if (!borrowing) {
      throw new Error('Borrowing record not found or already returned');
    }

    const returnDate = new Date();
    borrowing.returnDate = returnDate;
    borrowing.status = BORROWING_STATUS.RETURNED;

    if (returnDate > borrowing.dueDate) {
      const daysOverdue = Math.ceil(
        (returnDate - borrowing.dueDate) / (1000 * 60 * 60 * 24)
      );
      borrowing.fine = daysOverdue * 5;
    }

    await borrowing.save();

    const book = await Book.findById(borrowing.book._id);
    book.availableCopies += 1;
    await book.save();

    await borrowing.populate(['user', 'book']);

    return borrowing;
  },

  getBorrowingHistory: async ({ page = 1, limit = 10, status }, context) => {
    if (!context.user) {
      throw new Error('Authentication required');
    }

    const userId = context.user._id;
    const query = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [borrowings, total] = await Promise.all([
      Borrowing.find(query)
        .populate('book', 'title author isbn genre')
        .populate('user', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ borrowDate: -1 }),
      Borrowing.countDocuments(query)
    ]);

    return {
      borrowings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit
      }
    };
  },

  getAllBorrowings: async ({ page = 1, limit = 10, status, userId }, context) => {
    if (!context.user || context.user.role !== 'Admin') {
      throw new Error('Admin access required');
    }

    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    const skip = (page - 1) * limit;

    const [borrowings, total] = await Promise.all([
      Borrowing.find(query)
        .populate('user', 'name email')
        .populate('book', 'title author isbn genre')
        .skip(skip)
        .limit(limit)
        .sort({ borrowDate: -1 }),
      Borrowing.countDocuments(query)
    ]);

    return {
      borrowings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit
      }
    };
  }
};

module.exports = borrowingResolvers;