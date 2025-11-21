const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const User = require('../models/User');

exports.getMostBorrowedBooks = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.borrowDate = {};
      if (startDate) matchStage.borrowDate.$gte = new Date(startDate);
      if (endDate) matchStage.borrowDate.$lte = new Date(endDate);
    }
    
    const mostBorrowedBooks = await Borrowing.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$book',
          borrowCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      {
        $unwind: '$bookDetails'
      },
      {
        $project: {
          _id: 0,
          bookId: '$_id',
          title: '$bookDetails.title',
          author: '$bookDetails.author',
          isbn: '$bookDetails.isbn',
          genre: '$bookDetails.genre',
          borrowCount: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $sort: { borrowCount: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    res.json({
      success: true,
      data: { mostBorrowedBooks }
    });
  } catch (error) {
    next(error);
  }
};

exports.getActiveMembers = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.borrowDate = {};
      if (startDate) matchStage.borrowDate.$gte = new Date(startDate);
      if (endDate) matchStage.borrowDate.$lte = new Date(endDate);
    }
    
    const activeMembers = await Borrowing.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$user',
          totalBorrowings: { $sum: 1 },
          booksReturned: {
            $sum: {
              $cond: [{ $eq: ['$status', 'returned'] }, 1, 0]
            }
          },
          booksBorrowed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'borrowed'] }, 1, 0]
            }
          },
          totalFines: { $sum: '$fine' },
          uniqueBooks: { $addToSet: '$book' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userDetails.name',
          email: '$userDetails.email',
          totalBorrowings: 1,
          booksReturned: 1,
          booksBorrowed: 1,
          totalFines: 1,
          uniqueBooksCount: { $size: '$uniqueBooks' }
        }
      },
      {
        $sort: { totalBorrowings: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    res.json({
      success: true,
      data: { activeMembers }
    });
  } catch (error) {
    next(error);
    }
};

exports.getBookAvailability = async (req, res, next) => {
  try {
    const [bookStats, borrowingStats] = await Promise.all([
      Book.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: null,
            totalBooks: { $sum: 1 },
            totalCopies: { $sum: '$totalCopies' },
            availableCopies: { $sum: '$availableCopies' },
            borrowedCopies: {
              $sum: { $subtract: ['$totalCopies', '$availableCopies'] }
            }
          }
        }
      ]),
      Borrowing.aggregate([
        {
          $match: { status: 'borrowed' }
        },
        {
          $group: {
            _id: null,
            activeBorrowings: { $sum: 1 },
            overdueBorrowings: {
              $sum: {
                $cond: [
                  { $lt: ['$dueDate', new Date()] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);
    
    const genreBreakdown = await Book.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$genre',
          totalBooks: { $sum: 1 },
          totalCopies: { $sum: '$totalCopies' },
          availableCopies: { $sum: '$availableCopies' },
          borrowedCopies: {
            $sum: { $subtract: ['$totalCopies', '$availableCopies'] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          genre: '$_id',
          totalBooks: 1,
          totalCopies: 1,
          availableCopies: 1,
          borrowedCopies: 1,
          utilizationRate: {
            $multiply: [
              {
                $divide: ['$borrowedCopies', '$totalCopies']
              },
              100
            ]
          }
        }
      },
      {
        $sort: { totalBooks: -1 }
      }
    ]);
    
    const stats = bookStats[0] || {
      totalBooks: 0,
      totalCopies: 0,
      availableCopies: 0,
      borrowedCopies: 0
    };
    
    const borrowings = borrowingStats[0] || {
      activeBorrowings: 0,
      overdueBorrowings: 0
    };
    
    res.json({
      success: true,
      data: {
        summary: {
          ...stats,
          activeBorrowings: borrowings.activeBorrowings,
          overdueBorrowings: borrowings.overdueBorrowings,
          utilizationRate: stats.totalCopies > 0 
            ? ((stats.borrowedCopies / stats.totalCopies) * 100).toFixed(2) 
            : 0
        },
        genreBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOverdueBooks = async (req, res, next) => {
  try {
    const overdueBooks = await Borrowing.aggregate([
      {
        $match: {
          status: 'borrowed',
          dueDate: { $lt: new Date() }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $unwind: '$bookDetails'
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: '$userDetails._id',
            name: '$userDetails.name',
            email: '$userDetails.email'
          },
          book: {
            _id: '$bookDetails._id',
            title: '$bookDetails.title',
            author: '$bookDetails.author',
            isbn: '$bookDetails.isbn'
          },
          borrowDate: 1,
          dueDate: 1,
          daysOverdue: {
            $ceil: {
              $divide: [
                { $subtract: [new Date(), '$dueDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          potentialFine: {
            $multiply: [
              {
                $ceil: {
                  $divide: [
                    { $subtract: [new Date(), '$dueDate'] },
                    1000 * 60 * 60 * 24
                  ]
                }
              },
              5
            ]
          }
        }
      },
      {
        $sort: { daysOverdue: -1 }
      }
    ]);
    
    res.json({
      success: true,
      data: { 
        overdueBooks,
        totalOverdue: overdueBooks.length
      }
    });
  } catch (error) {
    next(error);
  }
};