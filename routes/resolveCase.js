const express = require('express');
const router = express.Router();
const CaseDetails = require('../models/CaseDetails');
const User = require('../models/User');

router.get(
    '/resolveCase/:id',
    (req, res) => {
        const id = req.params.id;
        console.log(id);
    }
);

module.exports = router;