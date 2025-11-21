const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    _id: ID!
    name: String!
    email: String!
    role: String!
    isActive: Boolean!
    createdAt: String!
  }

  type Book {
    _id: ID!
    title: String!
    author: String!
    isbn: String!
    publicationDate: String!
    genre: String!
    totalCopies: Int!
    availableCopies: Int!
    description: String
    isActive: Boolean!
    createdAt: String!
  }

  type Borrowing {
    _id: ID!
    user: User!
    book: Book!
    borrowDate: String!
    dueDate: String!
    returnDate: String
    status: String!
    fine: Float!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type PaginatedBooks {
    books: [Book!]!
    pagination: Pagination!
  }

  type PaginatedBorrowings {
    borrowings: [Borrowing!]!
    pagination: Pagination!
  }

  type Pagination {
    currentPage: Int!
    totalPages: Int!
    totalRecords: Int!
    limit: Int!
  }

  type MostBorrowedBook {
    bookId: ID!
    title: String!
    author: String!
    isbn: String!
    genre: String!
    borrowCount: Int!
    uniqueUsersCount: Int!
  }

  type ActiveMember {
    userId: ID!
    name: String!
    email: String!
    totalBorrowings: Int!
    booksReturned: Int!
    booksBorrowed: Int!
    totalFines: Float!
    uniqueBooksCount: Int!
  }

  type BookAvailabilitySummary {
    totalBooks: Int!
    totalCopies: Int!
    availableCopies: Int!
    borrowedCopies: Int!
    activeBorrowings: Int!
    overdueBorrowings: Int!
    utilizationRate: Float!
  }

  type GenreBreakdown {
    genre: String!
    totalBooks: Int!
    totalCopies: Int!
    availableCopies: Int!
    borrowedCopies: Int!
    utilizationRate: Float!
  }

  type BookAvailabilityReport {
    summary: BookAvailabilitySummary!
    genreBreakdown: [GenreBreakdown!]!
  }

  type OverdueBookInfo {
    _id: ID!
    user: User!
    book: Book!
    borrowDate: String!
    dueDate: String!
    daysOverdue: Int!
    potentialFine: Float!
  }

  type OverdueReport {
    overdueBooks: [OverdueBookInfo!]!
    totalOverdue: Int!
  }

  type Query {
    # Auth
    getProfile: User!

    # Books
    listBooks(page: Int, limit: Int, genre: String, author: String, search: String): PaginatedBooks!
    getBook(id: ID!): Book!

    # Borrowings
    getBorrowingHistory(page: Int, limit: Int, status: String): PaginatedBorrowings!
    getAllBorrowings(page: Int, limit: Int, status: String, userId: ID): PaginatedBorrowings!

    # Reports
    getMostBorrowedBooks(limit: Int, startDate: String, endDate: String): [MostBorrowedBook!]!
    getActiveMembers(limit: Int, startDate: String, endDate: String): [ActiveMember!]!
    getBookAvailability: BookAvailabilityReport!
    getOverdueBooks: OverdueReport!
  }

  type Mutation {
    # Auth
    register(name: String!, email: String!, password: String!, role: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Books (Admin only)
    addBook(
      title: String!
      author: String!
      isbn: String!
      publicationDate: String!
      genre: String!
      totalCopies: Int!
      description: String
    ): Book!
    
    updateBook(
      id: ID!
      title: String
      author: String
      isbn: String
      publicationDate: String
      genre: String
      totalCopies: Int
      description: String
    ): Book!
    
    deleteBook(id: ID!): Boolean!

    # Borrowing
    borrowBook(bookId: ID!): Borrowing!
    returnBook(borrowingId: ID!): Borrowing!
  }
`);

module.exports = schema;