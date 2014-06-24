var express = require('express');
var router = express.Router();
var passport = require('passport')


router.get('/login', function(req, res){
  res.render('login', {title: 'Login', page: 'login'});
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/login', 
}));

router.get('/auth/google', passport.authenticate('google-oauth'));

router.get('/auth/google/callback', function(req, res) {
    // check to see if we have the access and refresh token at this point...
});

module.exports = router;
