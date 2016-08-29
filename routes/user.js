var express = require('express');
var router = express.Router();
var Cart = require('../models/cart')
var passport = require('passport')
var Product = require('../models/products');
var Order = require('../models/order')
var bcrypt = require('bcrypt-nodejs');

var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);

//換密碼
var auth = require('passport-local-authenticate');
var User = require('../models/user');

//寄感謝註冊信
var nodemailer = require('nodemailer');
var credentials = require('../config/credentials')

var mailTransport = nodemailer.createTransport('SMTP',{
    service: 'Gmail',
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password
    }
});
//寄感謝註冊信


router.get('/profile', isLoggedIn, function (req, res, next) {
    Order.find({user: req.user}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', { orders: orders });
    });
});

//換密碼
router.get('/changePassword', isLoggedIn, function(req, res, next) {
  var messages = req.flash('error')
	res.render('user/changePassword', {csrfToken: req.csrfToken(), message:messages, hasError:messages.length>0})
})

router.post('/changePassword', function(req, res, next) {
  var accountId = req.user._id;
  var Newpassword = req.body.Newpassword;

  if(!bcrypt.compareSync(req.body.Oldpassword, req.user.password) || req.body.Oldpassword.length==0){
    req.flash('error','請輸入原本密碼');
    return res.redirect('/user/changePassword');
  }

  if(Newpassword !== req.body.confirmpassword || req.body.confirmpassword.length==0) {
    req.flash('error','請確認密碼');
    return res.redirect('/user/changePassword');
  }
  var passwordbcyypt = bcrypt.hashSync(Newpassword, bcrypt.genSaltSync(5), null);
  User.update({_id:accountId},{$set:{'password': passwordbcyypt}},function(err) {
    if(err) {
      console.log(err)
    }
  });
  req.flash('success','成功更換密碼')
  res.redirect('/')
})
//結束換密碼

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
})

router.use('/', notLoggedIn, function(req, res, next) {
  next();
})



router.get('/signup', function(req, res, next) {
  var messages = req.flash('error')
  res.render('user/signup', {csrfToken: req.csrfToken(), message:messages , hasError: messages.length>0})
})

// router.post('/signup', passport.authenticate('local.signup', {
// 	successRedirect: 'profile',
// 	failureRedirect: 'signup',
// 	failureFlash: true
// })， function(req, res, next) {
//   console.log('hihitest')
// })

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), function (req, res, next) {
   var email = req.body.email
    console.log(email)
   res.render('mail/user3Q', {email:email}, function(err, html) {
     if(err){
         console.log('error in email template');
     }
     mailTransport.sendMail({
       from: '"ColdbirdOuO ShoppingCart" <moopen200@gmail.com>', // sender address
       to: email, // list of receivers
       subject: 'Welcome to ColdbirdOuO ShoppingCart', // Subject line
       html: html
     }, function(err) {
         if(err){
             console.error('Unable to send confirmation: ' + err.stack)
         };
     });
   })
   res.render('mail/user3QforWeb',{email:email});
});


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
