var express = require('express');
var router = express.Router();
var app = require('../app');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/article', function(req, res){
  var opts = {};
  opts.title = 'Article page';
  res.render('article', opts);
});

module.exports = router;
