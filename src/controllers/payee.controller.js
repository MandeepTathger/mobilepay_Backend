'use strict'

require('dotenv').config() 
const Payee = require('../models/payee.model')
const httpStatus = require('http-status')
const mongoose = require('mongoose');
const request = require('request');

const YOUR_KEY = process.env.KEY_ID;
const YOUR_SECRET = process.env.SECRET_KEY;

exports.create = async (req, res, next) => {
  try {
    const reqBody = req.body
    reqBody.parentId = new mongoose.Types.ObjectId(reqBody.parentId)

    const options = {
      url: 'https://api.razorpay.com/v1/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
      },
      body: JSON.stringify({name: reqBody.name, reference_id: reqBody.parentId})
    };
  
    request(options, (error, response, body) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      } 
      else {

        const parseBody = JSON.parse(body)
        if(!parseBody.error){
          reqBody.contactId = parseBody.id

          const fundOptions = {
            url: 'https://api.razorpay.com/v1/fund_accounts',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
            },
            body: JSON.stringify({
              "contact_id": parseBody.id,
              "account_type": "bank_account",
              "bank_account": {
                "name": reqBody.name,
                "ifsc": reqBody.IFSCCode,
                "account_number": reqBody.accountNumber
              }
            })
          };
  
          request(fundOptions, async(error, response, body) => {
            const parseBody = JSON.parse(body)
            if (error) {
              console.error(error);
              res.status(500).json({ error: 'Internal Server Error' });
            } else if(!parseBody.error) {
              console.log(parseBody, "dhsajgdhjg ")
              reqBody.fundAccountId = parseBody.id

              const payee = new Payee(reqBody)
              const savedPayee = await payee.save()
              res.status(httpStatus.CREATED)
              res.send(savedPayee)

              // res.json(JSON.parse(body));
  
                // const validateOptions = {
                //   url: 'https://api.razorpay.com/v1/fund_accounts/validations',
                //   method: 'POST',
                //   headers: {
                //     'Content-Type': 'application/json',
                //     'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
                //   },
                //   body: JSON.stringify({
                //     "account_number": reqBody.accountNumber,
                //     "fund_account": {
                //       "id": parseBody.id
                //     },
                //     "amount": 100,
                //     "currency": "INR"
                //   })
                // };
  
                // request(validateOptions, (error, response, body) => {
                //   if (error) {
                //     console.error(error);
                //     res.status(500).json({ error: 'Internal Server Error' });
                //   } else {
                //     const responseBody = JSON.parse(body);
                //     res.json(responseBody);
                //   }
                // });  
            } else {
              res.json(parseBody)
            }
          });
        } else {
          res.json(parseBody)
        }
       
      } 
    });
    
  } catch (error) {
    return next(Payee.checkDuplicatePayeeError(error))
  }
}

// exports.create = async (req, res, next) => {
//   try {
//     const reqBody = req.body;
//     reqBody.parentId = new mongoose.Types.ObjectId(reqBody.parentId);

//     const razorpayOptions = {
//       url: 'https://api.razorpay.com/v1/contacts',
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
//       },
//       body: JSON.stringify({ name: reqBody.name, reference_id: reqBody.parentId })
//     };

//     const razorpayResponse = await request(razorpayOptions);
//     const parseBody = JSON.parse(razorpayResponse);

//     if(!parseBody.error){
//       const fundOptions = {
//         url: 'https://api.razorpay.com/v1/fund_accounts',
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
//         },
//         body: JSON.stringify({
//           "contact_id": parseBody.id,
//           "account_type": "bank_account",
//           "bank_account": {
//             "name": reqBody.name,
//             "ifsc": reqBody.IFSCCode,
//             "account_number": reqBody.accountNumber
//           }
//         })
//       };
  
//       const fundResponse = await request(fundOptions);
//       const parseFundBody = JSON.parse(fundResponse);
//       console.log(parseFundBody, "dhsajgdhjg ");
  
//       if (!parseFundBody.error) {
//         const validateOptions = {
//           url: 'https://api.razorpay.com/v1/fund_accounts/validations',
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
//           },
//           body: JSON.stringify({
//             "account_number": reqBody.accountNumber,
//             "fund_account": {
//               "id": parseFundBody.id
//             },
//             "amount": 100,
//             "currency": "INR"
//           })
//         };
  
//         const validationResponse = await request(validateOptions);
//         const responseBody = JSON.parse(validationResponse);
//         console.log(responseBody, "responseBody>");

   
//       }
//     }
    
    
//     // Handle any further logic or response here if needed

//   } catch (error) {
//     console.log(error, "vhjgjhgjhgjghj")
//     return next(Payee.checkDuplicatePayeeError(error));
//   }
// }

exports.getPayee = async (req, res, next) => {
  try {
    const payee = await Payee.find({parentId: req.params.parentId})
    res.send(payee)
  } catch (error) {
    next(error)
  }
}


exports.delete = async (req, res, next) => {
  try {
    const users = await Payee.findByIdAndDelete(req.params.id)
    res.send(users)
  } catch (error) {
    next(error)
  }
}



