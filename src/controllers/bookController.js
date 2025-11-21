const Book = require('../models/Book');

exports.addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, publicationDate, genre, totalCopies, description } = req.body;
    
    const book = await Book.create({
      title,
      author,
      isbn,
      publicationDate,
      genre,
      totalCopies,
      availableCopies: totalCopies,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: { book }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.availableCopies !== undefined) {
      delete updates.availableCopies;
    }
    
    const book = await Book.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { book }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.listBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, genre, author, search } = req.query;
    
    const query = { isActive: true };
    
    if (genre) query.genre = genre;
    if (author) query.author = new RegExp(author, 'i');
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [books, total] = await Promise.all([
      Book.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Book.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalBooks: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findOne({ _id: id, isActive: true });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: { book }
    });
  } catch (error) {
    next(error);
  }
};