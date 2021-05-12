const {ObjectId} = require('mongodb');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');

//include auth fn
const {ensureAuthenticated} = require('../config/auth');

//include model
const LawyerDetails = require('../models/LawyerDetails');
const CaseDetails = require('../models/CaseDetails');
const User = require('../models/User');

//dashboard
router.get
(
    '/dashboard',
    ensureAuthenticated,
    async (req, res) =>
    {
        if(req.user.is_profile_complete === "N")
            res.redirect('/lawyer/profile');
        else
            await CaseDetails.find
            (
                {
                    lawyer_id: ObjectId(req.user.id)
                }
            ).then
            (
                (cases) =>
                {
                    res.render('lawyer_dashboard', {f_name: req.user.fname, cases});
                }
            ).catch
            (
                (err) => console.log(err)
            );        
    }
);

//profile
router.get
(
    '/profile',
    ensureAuthenticated,
    (req, res) =>
    {
        res.render('lawyer_profile', {f_name: req.user.fname});
    }
);
router.post
(
    '/profile',
    ensureAuthenticated,
    async (req, res) =>
    {
        //comma separated preferred case types to arr
        const pref_case_types = req.body.pref_case_types;
        const pref_case_types_arr = pref_case_types.split(",");
        pref_case_types_arr.forEach((case_type) => case_type = case_type.trim());
        
        const new_lawyer_details = new LawyerDetails
        (
            {
                lawyer_id: req.user._id,
                bar_council_id: req.body.bar_id,
                company_name: req.body.company_name,
                pref_case_types: pref_case_types_arr,
                exp_yrs: req.body.exp_yrs,
                experience: req.body.exp,
                fees: req.body.fees,
                fee_descp: req.body.fee_descp,
                dob: req.body.dob,
                age: req.body.age,
                ph_no: req.body.ph_no
            }
        );

        await new_lawyer_details.save().then
        (
            async (new_lawyer_obj) =>
            {
                await User.updateOne
                (
                    {
                        _id: req.user._id
                    },
                    {
                        $set: {
                            is_profile_complete: "Y"
                        }
                    }
                ).then
                (
                    res.redirect('/lawyer/dashboard')
                ).catch
                (
                    (err) => console.log(err)
                );
            }
        ).catch
        (
            (err) => console.log(err)
        );
    }
);

//display profile
router.get
(
    '/display_lawyer_profile/:lawyer_id',
    ensureAuthenticated,
    async (req, res) =>
    {
        await LawyerDetails.find
        (
            {
                lawyer_id: ObjectId(req.params.lawyer_id)
            }
        ).then
        (
            async (lawyer_details) =>
            {
                await User.find
                (
                    {
                        _id: ObjectId(req.params.lawyer_id)
                    }
                ).then
                (
                    (lawyer_bio) =>
                    {
                        const {fname, mname, lname, email} = lawyer_bio[0];
                        const {company_name, pref_case_types, exp_yrs, experience, fees, fee_descp, dob, age, ph_no} = lawyer_details[0];

                        res.render('display_lawyer_profile', {fname, mname, lname, email, company_name, pref_case_types, exp_yrs, experience, fees, fee_descp, dob, age, ph_no});
                    }
                ).catch
                (
                    (err) => console.log(err)
                );
            }
        ).catch
        (
            (err) => console.log(err)
        ); 
    }
);

//resolve case
router.get('/resolveCase/:case_id', (req, res) => {
    const case_id = req.params.case_id;
    console.log(case_id);
    
    CaseDetails.findByIdAndUpdate(case_id, {isResolved: 'Y'}, { returnOriginal: false }, (err, result) => {
        if(err) console.log(err);
        console.log(result);
    })
    .then(
        res.redirect('/lawyer/dashboard')
    )
})

//middleware for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:/Users/gopib/Documents/VS-CODE/court-case-management-sgp/static/uploads/')
    },
    filename: function (req, file, cb) {
        const parts = file.mimetype.split("/");
        cb(null, `${file.fieldname}-${Date.now()}.${parts[1]}`)
    }
})

const upload = multer({storage}).single("invoice-file");

//sendind an invoice
router.post('/sendInvoice/:case_id', (req, res) => {

    const case_id = req.params.case_id;
    CaseDetails.findById(case_id, (err, result) => {
            if(err) {
                console.log(err)
            } else {

                User.findById(result.client_id, (err, result) => {
                    if(err) {
                        console.log(err);
                    } else {
                        const client_email = result.email;
                        // console.log('client email : ' + result.email);
                        upload(req, res, (err) => {
                            if(err) {
                                console.log(err);
                            } else {
                    
                                const path = req.file.path;
                    
                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                      user: 'jayvirchudasama7@gmail.com',
                                      pass: 'npteljayvir1912'
                                    }
                                  });
                    
                                const mailOptions = {
                                    from: 'jayvirchudasama7@gmail.com',
                                    to: client_email,
                                    subject: 'Invoice',
                                    text: 'the invoice for the recent hearing has been attached below',
                                    attachments: [
                                      {
                                       path: path
                                      }
                                   ]
                                  };
                    
                                  transporter.sendMail(mailOptions, (err, info) => {
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        console.log('Invoice sent!!!' + info.response);
                                        res.redirect('/lawyer/invoice_sent');
                                        fs.unlink(path, (err) => {
                                            if(err) {
                                                console.log(err);
                                            } else {
                                                console.log('file deleted');
                                            }
                                        })
                                    }
                                })
                    
                    
                            }
                        })
                    }
                })
            }
            // console.log(result);
        })
    
})

router.get('/invoice_sent', (req, res) => {
    res.render("invoice_sent");
})


module.exports = router;