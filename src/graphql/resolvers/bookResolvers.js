const Book = require('../../models/Book');

const bookResolvers = {
  listBooks: async ({ page = 1, limit = 10, genre, author, search }, context) => {
    const query = { isActive: true };

    if (genre) query.genre = genre;
    if (author) query.author = new RegExp(author, 'i');
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      Book.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Book.countDocuments(query)
    ]);

    return {
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit
      }
    };
  },

  getBook: async ({ id }) => {
    const book = await Book.findOne({ _id: id, isActive: true });
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  },

  addBook: async (args, context) => {
    if (!context.user || context.user.role !== 'Admin') {
      throw new Error('Admin access required');
    }

    const { title, author, isbn, publicationDate, genre, totalCopies, description } = args;

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

    return book;
  },

  updateBook: async ({ id, ...updates }, context) => {
    if (!context.user || context.user.role !== 'Admin') {
      throw new Error('Admin access required');
    }

    if (updates.availableCopies !== undefined) {
      delete updates.availableCopies;
    }

    const book = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!book) {
      throw new Error('Book not found');
    }

    return book;
  },

  deleteBook: async ({ id }, context) => {
    if (!context.user || context.user.role !== 'Admin') {
      throw new Error('Admin access required');
    }

    const book = await Book.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!book) {
      throw new Error('Book not found');
    }

    return true;
  }
};

module.exports = bookResolvers;