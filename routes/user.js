var express = require('express');
var router = express.Router();
var Cart = require('../models/cart')
var passport = require('passport')
var Product = require('../models/products');
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn,function(req, res, next) {
	res.render('user/profile')
})

router.use('/', notLoggedIn, function(req, res, next) {
  next();
})

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
})

router.get('/signup', function(req, res, next) {
  var messages = req.flash('error')
  res.render('user/signup', {csrfToken: req.csrfToken(), message:messages , hasError: messages.length>0})
})

router.post('/signup', passport.authenticate('local.signup', {
	successRedirect: 'profile',
	failureRedirect: 'signup',
	failureFlash: true
}))

router.get('/signin', function(req, res, next) {
  var message = req.flash('error')
	res.render('user/signin', {csrfToken: req.csrfToken(), message: message, hasError: message.length>0})
})

router.post('/signin', passport.authenticate('local.signin', {
	successRedirect: 'profile',
	failureRedirect: 'signin',
	failureFlash: true
}))




function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if(!req.isAuthenticated()) {
    return next();
  }
    res.redirect('/');
}

module.exports = router;
