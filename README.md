# 📚 Nalanda Library Management System

A comprehensive, production-ready library management system built with **Node.js**, **Express**, **MongoDB**, and **GraphQL**. This system provides both REST and GraphQL APIs for managing library operations including user management, book inventory, borrowing system, and detailed analytics.

---

##  Features

### Core Functionality
-  **User Management**: Registration, login, and profile management with role-based access control
-  **Book Management**: Complete CRUD operations with advanced search and filtering
-  **Borrowing System**: Borrow and return books with automatic due date tracking
-  **Fine Calculation**: Automatic calculation of fines for overdue books ($5/day)
-  **Reports & Analytics**: Comprehensive reports using MongoDB aggregation pipeline

### Security Features
-  **Encrypted JWT Tokens**: Double-layer security with AES encryption
-  **Password Hashing**: Bcrypt for secure password storage
-  **Role-Based Access Control**: Admin and Member roles with different permissions
-  **Input Validation**: Mongoose schema validation
-  **Error Handling**: Comprehensive error handling middleware

### API Support
-  **RESTful API**: Complete REST endpoints with proper HTTP methods
-  **GraphQL API**: Full GraphQL implementation with queries and mutations
-  **Pagination**: All list endpoints support pagination
-  **Filtering**: Advanced search and filter capabilities

### Reports & Analytics
-  Most borrowed books
-  Most active members
-  Book availability statistics with genre breakdown
-  Overdue books tracking with fine calculation

---

##  Project Structure
```
nalanda-library/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── jwt.js               # JWT encryption/decryption
│   │   └── constants.js         # Application constants
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Book.js              # Book schema
│   │   └── Borrowing.js         # Borrowing schema
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── roleCheck.js         # Role-based access control
│   │   └── errorHandler.js      # Global error handler
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── bookController.js    # Book CRUD logic
│   │   ├── borrowingController.js # Borrowing logic
│   │   └── reportController.js  # Reports & analytics
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── bookRoutes.js        # Book endpoints
│   │   ├── borrowingRoutes.js   # Borrowing endpoints
│   │   └── reportRoutes.js      # Report endpoints
│   ├── graphql/
│   │   ├── schema.js            # GraphQL schema
│   │   ├── context.js           # GraphQL context
│   │   └── resolvers/           # GraphQL resolvers
│   │       ├── index.js
│   │       ├── userResolvers.js
│   │       ├── bookResolvers.js
│   │       ├── borrowingResolvers.js
│   │       └── reportResolvers.js
│   └── app.js                   # Express app setup
├── .env                         # Environment variables
├── .gitignore                   # Git ignore file
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

---

##  Getting Started

### Prerequisites
```bash
Node.js >= 14.0.0
MongoDB >= 4.4
npm >= 6.0.0
```

### Installation

1. **Clone the repository**
```bash
git clone <your-repository-url>
cd nalanda-library
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nalanda-library
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
JWT_ENCRYPTION_KEY=32_character_encryption_key_1234567890abcdef
NODE_ENV=development
```

4. **Start MongoDB**

**Windows:**
```bash
net start MongoDB
```

5. **Run the application**

**Production mode:**
```bash
npm start
```

6. **Access the APIs**
- REST API: `http://localhost:5000/api`
- GraphQL: `http://localhost:5000/graphql`
- Health Check: `http://localhost:5000/`

---

##  Database Schema

### User Schema
```javascript
{
  name: String (required, min: 2 chars),
  email: String (required, unique, validated),
  password: String (required, hashed, min: 6 chars),
  role: String (Admin/Member, default: Member),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Book Schema
```javascript
{
  title: String (required, indexed),
  author: String (required, indexed),
  isbn: String (required, unique, 10 or 13 digits),
  publicationDate: Date (required),
  genre: String (required, indexed),
  totalCopies: Number (required, min: 0),
  availableCopies: Number (required, min: 0),
  description: String,
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Borrowing Schema
```javascript
{
  user: ObjectId (ref: User, indexed),
  book: ObjectId (ref: Book, indexed),
  borrowDate: Date (default: now),
  dueDate: Date (auto: borrowDate + 14 days),
  returnDate: Date (nullable),
  status: String (borrowed/returned/overdue),
  fine: Number (calculated on return, min: 0),
  timestamps: true
}
```

---

##  Authentication Flow

### 1. Register
**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Member"
    },
    "token": "encrypted_jwt_token_here"
  }
}
```

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}

## API Documentation

### REST API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Auth required)

#### Books
- `GET /api/books` - List all books (Public)
- `GET /api/books/:id` - Get single book (Public)
- `POST /api/books` - Add new book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

#### Borrowing
- `POST /api/borrowing/borrow` - Borrow a book (Member)
- `POST /api/borrowing/return` - Return a book (Member)
- `GET /api/borrowing/history` - Get borrowing history (Member)
- `GET /api/borrowing/all` - Get all borrowings (Admin only)

#### Reports
- `GET /api/reports/most-borrowed-books` - Most borrowed books
- `GET /api/reports/active-members` - Most active members (Admin only)
- `GET /api/reports/book-availability` - Book availability summary
- `GET /api/reports/overdue-books` - Overdue books report (Admin only)

---

##  Testing the APIs

### Using cURL

**1. Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "Member"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**3. Add a book (Admin):**
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "publicationDate": "1925-04-10",
    "genre": "Fiction",
    "totalCopies": 5,
    "description": "A classic American novel"
  }'
```

**4. List books:**
```bash
curl http://localhost:5000/api/books?page=1&limit=10
```

**5. Borrow a book:**
```bash
curl -X POST http://localhost:5000/api/borrowing/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bookId": "BOOK_ID_HERE"
  }'
```

---

## GraphQL API

### Access GraphQL Playground
In development mode, access the interactive playground at:
```
http://localhost:5000/graphql
```

### Sample GraphQL Queries

**1. Register User:**
```graphql
mutation {
  register(
    name: "Jane Smith"
    email: "jane@example.com"
    password: "password123"
    role: "Member"
  ) {
    user {
      _id
      name
      email
      role
    }
    token
  }
}
```

**2. Login:**
```graphql
mutation {
  login(email: "jane@example.com", password: "password123") {
    user {
      _id
      name
      email
      role
    }
    token
  }
}
```

**3. List Books:**
```graphql
query {
  listBooks(page: 1, limit: 10, genre: "Fiction") {
    books {
      _id
      title
      author
      isbn
      genre
      availableCopies
      totalCopies
    }
    pagination {
      currentPage
      totalPages
      totalRecords
    }
  }
}
```

**4. Borrow Book:**
```graphql
mutation {
  borrowBook(bookId: "BOOK_ID_HERE") {
    _id
    borrowDate
    dueDate
    status
    book {
      title
      author
    }
  }
}
```

**5. Get Reports:**
```graphql
query {
  getMostBorrowedBooks(limit: 10) {
    title
    author
    borrowCount
    uniqueUsersCount
  }
  
  getBookAvailability {
    summary {
      totalBooks
      availableCopies
      borrowedCopies
      utilizationRate
    }
    genreBreakdown {
      genre
      totalBooks
      availableCopies
      utilizationRate
    }
  }
}
```

---

##  Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| GraphQL | Query language |
| express-graphql | GraphQL middleware |
| JWT | Authentication |
| Bcrypt.js | Password hashing |
| Crypto-JS | Token encryption |
| CORS | Cross-origin resource sharing |

---

##  MongoDB Aggregations

The system uses advanced MongoDB aggregation pipelines for generating reports:

### 1. Most Borrowed Books
- Groups borrowings by book
- Counts total borrows and unique users
- Joins with books collection
- Sorts by borrow count

### 2. Active Members
- Groups borrowings by user
- Calculates total borrowings, returns, and fines
- Joins with users collection
- Sorts by activity level

### 3. Book Availability
- Aggregates total books and copies
- Calculates utilization rates
- Provides genre-wise breakdown
##  Task Requirements Checklist
