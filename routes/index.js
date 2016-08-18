var express = require('express');
var router = express.Router();
var Cart = require('../models/cart')
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

router.get('/add-to-cart/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, function(err, product){
    if(err) {
      return res.redirect('/');
    }
    cart.add(product, productId);
    console.log(cart)
    req.session.cart = cart
    res.redirect('/')
  })
})

router.get('/shopping-cart', function(req, res,next) {
  if(!req.session.cart) {
    return res.render('shop/cart', {products: null})
  }
  var cart = new Cart(req.session.cart)
  var products = cart.generateArray();
  res.render('shop/cart', {products: products})
})

router.get('/user/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
})

router.get('/user/signup', function(req, res, next) {
  var messages = req.flash('error')
  res.render('user/signup', {csrfToken: req.csrfToken(), message:messages , hasError: messages.length>0})
})

router.post('/user/signup', passport.authenticate('local.signup', {
	successRedirect: '/user/profile',
	failureRedirect: '/user/signup',
	failureFlash: true
}))

router.get('/user/signin', function(req, res, next) {
	res.render('user/signin', {csrfToken: req.csrfToken()})
})

router.post('/user/signin', passport.authenticate('local.signin', {
	successRedirect: '/user/profile',
	failureRedirect: '/user/signin',
	failureFlash: true
}))


router.get('/user/profile', isLoggedIn,function(req, res, next) {
	res.render('user/profile')
})

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
