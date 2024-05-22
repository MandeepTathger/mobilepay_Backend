'use strict'

const express = require('express')
const router = express.Router()
const transactionController = require('../../controllers/transaction.controller')


router.post('/payment', transactionController.payment)
router.post('/create', transactionController.create)
router.get('/getTransactions/:id', transactionController.getTransactions)
router.get('/getLast5Transactions/:id', transactionController.getLast5Transactions)

// router.post('/payment', (req, res) => {
//   var options = {
//     amount: 100,  // amount in the smallest currency unit
//     currency: "INR",
//     receipt: "order_rcptid_11"
//   };
//   instance.orders.create(options, function(err, order) {
//     console.log(order);
//     if(!err){
//       res.send(order)
//     }
//   });

//   // instance.qrCode.create({
//   //   type: "upi_qr",
//   //   name: "Store Front Display",
//   //   usage: "single_use",
//   //   fixed_amount: true,
//   //   payment_amount: 300,
//   //   description: "For Store 1",
//   //   customer_id: "cust_NuUpswAb9ABddc",
//   //   // close_by: 1681615838,
//   //   notes: {
//   //     purpose: "Test UPI QR Code notes"
//   //   }
//   // }, function(err, order) {
//   //   console.log(order, "shajkhjk", err);
//   //   if(!err){
//   //     res.send(order)
//   //   }
//   // })
// })

module.exports = router