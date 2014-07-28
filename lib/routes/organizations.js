var express = require('express');
var router = express.Router();
var passport = require('passport');
var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;
var models = require('../models')


router.get('/login', function(req, res){
  res.render('login', {title: 'Login', page: 'login'});
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/login', 
}));


router.all('/join', function(req, res) {
    var form = forms.create({
        domain: fields.string({ required: true }),
        shortUrl: fields.url(), 
        password: fields.password({ required: true }),
        confirm:  fields.password({
            required: true,
            validators: [validators.matchField('password')]
        }),
        email: fields.email()
    });

    form.handle(req, {
        success: function (form) {
            models.Organization.create(form.data)
                .complete(function(err, organization){
                    req.logIn(organization, function(err){
                        res.redirect('settings');
                    });
                })
                .error(function(){
                    // very likely because this organization already exists
                });
        },
        error: function (form) {
            res.render('join', {form: form.toHTML()});
        },
        empty: function (form) {
            // there was no form data in the request
            res.render('join', {form: form.toHTML()});
        }
    });
});

router.all('/settings', function(req, res) {
    console.log(req.user);
    res.render('settings', {hasToken: false});
});


module.exports = router;
