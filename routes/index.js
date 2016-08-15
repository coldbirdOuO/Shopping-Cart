var express = require('express');
var router = express.Router();

var passport = require('passport')
var Product = require('../models/products');
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);

/* GET home page. */
router.get('/', function(req, res, next) {
  Product.find(function(err, result) {
      res.render('index', { title: 'Shopping-Cart', products: result });
  })

});

router.get('/user/signup', function(req, res, next) {
  var messages = req.flash('error')
  res.render('user/signup', {csrfToken: req.csrfToken(), message:messages , hasError: messages.length>0})
})

router.post('/user/signup', passport.authenticate('local.signup', {
	successRedirect: '/profile',
	failureRedirect: '/user/signup',
	failureFlash: true
}))

router.get('/user/signin', function(req, res, next) {
	res.render('user/signin')
})

router.get('/profile', function(req, res, next) {
	res.render('user/profile')
})
module.exports = router;
