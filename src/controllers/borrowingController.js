const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const { BORROWING_STATUS } = require('../config/constants');

exports.borrowBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;
    
    const book = await Book.findOne({ _id: bookId, isActive: true });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for borrowing'
      });
    }
    
    const existingBorrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: BORROWING_STATUS.BORROWED
    });
    
    if (existingBorrowing) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book'
      });
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
    
    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: { borrowing }
    });
  } catch (error) {
    next(error);
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const { borrowingId } = req.body;
    const userId = req.user._id;
    
    const borrowing = await Borrowing.findOne({
      _id: borrowingId,
      user: userId,
      status: BORROWING_STATUS.BORROWED
    }).populate('book');
    
    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found or already returned'
      });
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
    
    res.json({
      success: true,
      message: 'Book returned successfully',
      data: { borrowing }
    });
  } catch (error) {
    next(error);
  }
};

exports.getBorrowingHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: userId };
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [borrowings, total] = await Promise.all([
      Borrowing.find(query)
        .populate('book', 'title author isbn genre')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ borrowDate: -1 }),
      Borrowing.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        borrowings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBorrowings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [borrowings, total] = await Promise.all([
      Borrowing.find(query)
        .populate('user', 'name email')
        .populate('book', 'title author isbn genre')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ borrowDate: -1 }),
      Borrowing.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        borrowings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};