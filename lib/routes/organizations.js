var express = require('express');
var passport = require('passport');
var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;

var router = express.Router();

router.get('/login', function(req, res){
  res.render('login', {title: 'Login', page: 'login', user: req.user, page: 'settings'});
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/login'
  //failureFlash: true
}));

router.all('/settings', function(req, res) {
    res.render('settings', {hasToken: false});
});


module.exports = router;
