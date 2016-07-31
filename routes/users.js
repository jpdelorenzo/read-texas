var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  res.status(200).json({});
});

router.get('/:id', function(req, res, next) {
  res.status(200).json({});
});

module.exports = router;
