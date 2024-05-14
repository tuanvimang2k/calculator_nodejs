const express = require('express');
const router = express.Router();
// const config = require('config');
const dateFormat = require('dateformat');
const querystring = require('qs');
const crypto = require("crypto");

router.post('/create_payment_url', function (req, res, next) {
  const ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  // const tmnCode = config.get('vnp_TmnCode');
  // const secretKey = config.get('vnp_HashSecret');
  // const vnpUrl = config.get('vnp_Url');
  // const returnUrl = config.get('vnp_ReturnUrl');
  const tmnCode = '0IVDBS98';
  const secretKey = 'GOKCAV4CVRAKOEOR589Y3VIC6GW4ZGXJ';
  const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = 'http://localhost:4000/api/payment/success';

  const date = new Date();

  const createDate = dateFormat(date, 'yyyymmddHHmmss');
  const orderId = dateFormat(date, 'HHmmss');
  const amount = req.body.amount;
  const bankCode = req.body.bankCode;

  const orderInfo = req.body.orderDescription;
  const orderType = req.body.orderType;
  const locale = req.body.language || 'vn';
  const currCode = 'VND';

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;

  if (bankCode) {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  vnp_Params['vnp_SecureHash'] = signed;
  const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

  res.redirect(paymentUrl);
});

router.get('/vnpay_ipn', function (req, res, next) {
  let vnp_Params = req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  const secretKey = config.get('vnp_HashSecret');
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  if (secureHash === signed) {
    res.status(200).json({ RspCode: '00', Message: 'success' })
  } else {
    res.status(200).json({ RspCode: '97', Message: 'Fail checksum' })
  }
});

router.get('/vnpay_return', function (req, res, next) {
  let vnp_Params = req.query;

  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  const secretKey = config.get('vnp_HashSecret');
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  if (secureHash === signed) {
    res.render('success', { code: vnp_Params['vnp_ResponseCode'] })
  } else {
    res.render('success', { code: '97' })
  }
});

module.exports = router;