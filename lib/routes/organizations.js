var express = require('express');
var passport = require('passport');
var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;
var request = require('request');
var router = express.Router();
var settings = require('../settings');

router.get('/login', function(req, res){
  res.render('login', {title: 'Login', page: 'login', req: req, page: 'settings'});
});

function saveUser(req, res, next) {
    req.session.auth = {
        user: req.body.username, 
        pass: req.body.password
    }
    next();
}

// router.get('/api/articles', function(req, res){
// 	res.json(200, res);
// });

router.post('/login', saveUser, passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/login'
  //failureFlash: true
}));

module.exports = router;
