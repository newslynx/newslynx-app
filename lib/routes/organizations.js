var express = require('express');
var router = express.Router();
var passport = require('passport');
var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;


router.get('/login', function(req, res){
  res.render('login', {title: 'Login', page: 'login'});
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/login', 
}));

router.all('/settings', function(req, res) {
    console.log(req.user);
    res.render('settings', {hasToken: false});
});


module.exports = router;
