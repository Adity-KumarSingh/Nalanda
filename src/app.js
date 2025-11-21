require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const reportRoutes = require('./routes/reportRoutes');

const schema = require('./graphql/schema');
const rootResolver = require('./graphql/resolvers');
const createContext = require('./graphql/context');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Nalanda Library Management System API',
    version: '1.0.0',
    endpoints: {
      rest: {
        auth: '/api/auth',
        books: '/api/books',
        borrowing: '/api/borrowing',
        reports: '/api/reports'
      },
      graphql: '/graphql'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowing', borrowingRoutes);
app.use('/api/reports', reportRoutes);

module.exports = app;