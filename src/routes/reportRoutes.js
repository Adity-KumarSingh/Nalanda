const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/most-borrowed-books', reportController.getMostBorrowedBooks);
router.get('/active-members', checkRole(ROLES.ADMIN), reportController.getActiveMembers);
router.get('/book-availability', reportController.getBookAvailability);
router.get('/overdue-books', checkRole(ROLES.ADMIN), reportController.getOverdueBooks);

module.exports = router;