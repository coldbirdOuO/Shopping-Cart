var express = require('express');
var router = express.Router();
var Cart = require('../models/cart')

var Product = require('../models/products');

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
  res.render('shop/cart', {products: products, totalPrice: cart.price})
})

router.get('/checkout', function(req, res, next) {
  if(!req.session.cart) {
    res.redirect('shop/cart')
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout', {total: cart.price})
})


function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}



module.exports = router;
