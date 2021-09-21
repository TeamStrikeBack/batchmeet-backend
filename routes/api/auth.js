const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const nodemailer = require('nodemailer');


const auth = require('../../middleware/authMiddleware');


const User = require('../../models/User');
const { getMaxListeners } = require('../../models/User');


// @route  POST api/auth
// @desc   Authenticate user & get token -login
//@access  Public
router.post('/', [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const {email, password} = req.body;


        try {
            // See if user exists
            let user = await User.findOne({email})

            if (!user) {
                //object array return
                return res.status(400).json({errors: [{msg: 'Not found user'}]});
            }


            const isMatch = await bcrypt.compare( password,user.password);
            //
            if(!isMatch){
                return res.status(400).json({errors:[{msg:'Password incorrect'}]});
            }


            // Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id  
                }
            }

            jwt.sign(payload,
                config.get('jwtSecret'),
                {expiresIn: 36000000},
                (err, token) => {
                    if (err) throw err;
                    console.log(user.id);
                    res.json({token});
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }


    });



// @route  PUT api/auth
// @desc   Send Verification link to  a user
//@access  Public
router.put('/forgotpassword', async(req,res)=>{
    try{
        const {email} = req.body;
        const user = await User.findOne({email});
        console.log(email);


    if(!user){
        res.status(400).send('User does not exists');
    }else{

        const payload = {
            user : {
                id : user.id
            }
        }
        
        
        //Creating reset token to be passed
        const token = jwt.sign(payload,config.get('jwtResetPassword'),{expiresIn: 1900000});
        //Creating data to be passed in email
        //@CLIENT URL and authentication/activate route should be added from Client Side
        const data = `
            <h3> Please click on button below or click on the given link to reset your password</h3>
            <br/>
            <a href=${process.env.CLIENT_URL}/authentication/activate/${token}>
                <button 
                    style=" background-color:#0275d8;
                            border-radius:18px;
                            border:1px solid #0275d8;
                            display:inline-block;
                            cursor:pointer;
                            color:#ffffff;
                            font-family:Arial;
                            font-size:17px;
                            padding:16px 31px;
                            text-decoration:none;
                            text-shadow:0px 1px 0px #2f6627;">
                            
                Reset Password
                </button>
            </a>
            <br/>
            <p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>
        `;     
        
        try{
            // Updating reset link in database
            await user.updateOne({resetLink:token});
            await user.save();

            //Sending email to user
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                  user: 'noreply.batchmeet@gmail.com', 
                  pass: 'srilanka12345ruxi', 
                },
                tls:{
                    rejectUnauthorized:false
                }
            });
                
                
            let info = await transporter.sendMail({
                from: '"noreply" <noreply.batchmeet@gmail.com>', // sender address
                to: req.body.email, // list of receivers
                subject: "Reset your password", // Subject line
                text: "", // plain text body
                html: data, // html body
            });
                
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            
            res.status(200).send('Email Sent');

              
            }catch(err){
                res.status(400).send('Reset password link error');
                console.log(err.message);
            }
        

        
        }
    
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



// @route  PUT api/auth
// @desc   Password reset through link
//@access  Private
router.put('/resetpassword', async(req,res)=>{
   
    const{resetLink,newPass} = req.body;
    if(resetLink){
        await jwt.verify(resetLink,config.get('jwtResetPassword'));            
        try{
            const user = await User.findOne({resetLink});
            console.log(user);
            //Updating new password
            if(user){

                // Encrypt password
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(newPass,salt);
                user.resetLink = '';
                await user.save();

                
                res.status(200).send('Password changed successfully');
            
            }else{
                
                res.status(400).send('User with this token does not exist');
            }
            
        }catch (err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }

    }else{
        res.status(401).send('Authentication Error');
    }
   
});

module.exports = router;
