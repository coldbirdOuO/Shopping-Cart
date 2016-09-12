var express = require('express');
var router = express.Router();
var Cart = require('../models/cart')

var Product = require('../models/products');

//上傳檔案
var multer  = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './public/images')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
});
//上傳檔案(尾)

var url = require('url')

/* GET home page. */
router.get('/', function(req, res, next) {
  var loginMsg = req.flash('login');
  var SuccessBuying = req.flash('success');
  Product.find(function(err, result) {
      res.render('index', { title: 'Shopping-Cart', products: result , loginMsg: loginMsg, NotLogin:loginMsg.length>0, SuccessBuying: SuccessBuying, MsgBuying: SuccessBuying.length>0});
  })

});

router.get('/admin', function(req, res, next) {
  var SuccessBuying = req.flash('success');
  Product.find(function(err, result) {
      res.render('index', { title: 'Shopping-Cart', products: result, root:true, SuccessBuying: SuccessBuying, MsgBuying: SuccessBuying.length>0});
  })
})

router.get('/addItem', function(req, res, next) {
  res.render('backEnd/addItem')
})


router.post('/addItem', upload.array('field1', 5), function (req, res) {
  var ImagePath = req.files[0].path.substr(7)
  var product = new Product({
    productType:req.body.productType,
    title: req.body.title,
    description: req.body.description,
		imagePath: ImagePath,
		price: req.body.price
  })
  console.log(ImagePath)
  product.save(function(err, result){
    req.flash('success', '新增成功!');
    res.redirect('/admin');
  })

});


router.get('/delete/:id', function(req, res, next) {
  var productId = req.params.id;
  Product.findById(productId, function(err, product) {
    if(err) {
      return res.redirect('/');
    }
    product.remove()
    req.flash('success', '刪除成功！');
    res.redirect('/admin')
  })
})

router.get('/add-to-cart/:id', function(req, res, next) {
  var amount = parseInt(req.query.amount)
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, function(err, product){
    if(err) {
      return res.redirect('/');
    }
    cart.add(product, productId, amount);
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

router.get('/checkout', isLoggedIn,function(req, res, next) {
  if(!req.session.cart) {
    res.redirect('shop/cart')
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.price, errMsg:errMsg, noErrors:!errMsg})
})

router.post('/checkout', function(req, res, next) {
  var cart = new Cart(req.session.cart);
  var stripe = require("stripe")(
    "sk_test_gH5cAVIoBfP8N1s1Vx2jAhir"
  );
  stripe.charges.create({
    amount: cart.price * 100,
    currency: "usd",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Charge for david.anderson@example.com"
  }, function(err, charge) {
    if(err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    req.flash('success', 'Success brought product');
    req.session.cart = null;
    res.redirect('/');
  });
})



function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {

    return next();
  }
  req.flash('login', 'Please Login');
  res.redirect('/');
}



module.exports = router;
