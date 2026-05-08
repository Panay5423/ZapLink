const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');
const authMiddleware = require('../../common/middlewares/auth.middleware');

router.get('/users', authMiddleware, searchController.searchUsers);

module.exports = router;
