const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');


const auth = require('../../middleware/authMiddleware');


const User = require('../../models/User');


// @route  GET api/auth
// @desc   Test route
//@access  Public
//router.get('/',(req,res) => res.send('Auth route'));


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



module.exports = router;
