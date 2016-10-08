var express = require('express');
var router = express.Router();
var Cart = require('../models/cart')
var request = require('request');
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

router.post('/allpay', function(req, res, next) {
    //先取得檢查碼
    request.post({
        url: 'https://payment-stage.allpay.com.tw/AioHelper/GenCheckMacValue',
        form: req.body
    }, function(err, httpResponse, body) {
        //從歐付寶取得檢查碼後，組合成一個form
        console.log(body)
        var form = `
        傳送中...
        <form id="form" method="post" action="https://payment-stage.allpay.com.tw/Cashier/AioCheckOut/V2">
            <input type="hidden" name="MerchantID" value="${req.body.MerchantID}">
            <input type="hidden" name="MerchantTradeNo" value="${req.body.MerchantTradeNo}">
            <input type="hidden" name="MerchantTradeDate" value="${req.body.MerchantTradeDate}">
            <input type="hidden" name="PaymentType" value="${req.body.PaymentType}">
            <input type="hidden" name="TotalAmount" value="${req.body.TotalAmount}">
            <input type="hidden" name="TradeDesc" value="${req.body.TradeDesc}">
            <input type="hidden" name="ItemName" value="${req.body.ItemName}">
            <input type="hidden" name="ReturnURL" value="${req.body.ReturnURL}">
            <input type="hidden" name="ChoosePayment" value="${req.body.ChoosePayment}">
            <input type="hidden" name="CheckMacValue" value="${body}">
        </form>
         <script>
             document.getElementById('form').submit();
         </script>
        `;
        //加入自動送出的script後，回傳給前端
        console.log(form)
        res.send(form);
    });
});


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

    req.session.cart = cart
    res.redirect('/')
  })
})

router.get('/shopping-cart', function(req, res,next) {
  var now = new Date()
  var nowLocale = now.toLocaleString()
  var nowformat = nowLocale.replace(/-/g,'/')
  var RandonNumber = Math.round(Math.random() * 1000000000)
  if(!req.session.cart) {
    return res.render('shop/cart', {products: null})
  }
  var cart = new Cart(req.session.cart)
  var products = cart.generateArray();

  res.render('shop/cart', {products: products, totalPrice: cart.price, now: nowformat, RandonNumber: RandonNumber})
})



// router.get('/allpay', isLoggedIn,function(req, res, next) {
//   if(!req.session.cart) {
//     res.redirect('shop/cart')
//   }
//   var cart = new Cart(req.session.cart);
//   var errMsg = req.flash('error')[0];
//   res.render('shop/allpay', {total: cart.price, errMsg:errMsg, noErrors:!errMsg})
// })




function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {

    return next();
  }
  req.flash('login', 'Please Login');
  res.redirect('/');
}



module.exports = router;
