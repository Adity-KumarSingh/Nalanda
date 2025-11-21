const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const { ROLES } = require('../config/constants');

router.get('/', bookController.listBooks);
router.get('/:id', bookController.getBook);

router.post('/', authenticate, checkRole(ROLES.ADMIN), bookController.addBook);
router.put('/:id', authenticate, checkRole(ROLES.ADMIN), bookController.updateBook);
router.delete('/:id', authenticate, checkRole(ROLES.ADMIN), bookController.deleteBook);

module.exports = router;