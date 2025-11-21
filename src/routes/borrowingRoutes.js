const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowingController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const { ROLES } = require('../config/constants');

router.post('/borrow', authenticate, borrowingController.borrowBook);
router.post('/return', authenticate, borrowingController.returnBook);
router.get('/history', authenticate, borrowingController.getBorrowingHistory);

router.get('/all', authenticate, checkRole(ROLES.ADMIN), borrowingController.getAllBorrowings);

module.exports = router;