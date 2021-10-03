const express = require('express');
const { getBlog } = require('../controllers/blog');
const router = express.Router();

router.get('/', getBlog);

module.exports = router;