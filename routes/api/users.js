const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check,validationResult } = require('express-validator');
const auth=require('../../middleware/authMiddleware');



const  User = require('../../models/User');

// @route  GET api/users
// @desc   Test route
//@access  Public
router.get('/',(req,res) => res.send('User route'));



// @route  POST api/users
// @desc   Register user
//@access  Public
router.post('/',[
        check('name','Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('indexno','Index is required').not().isEmpty(),
        check('password','Please enter a password with 6 or more characters').isLength({min:6})
    ],
    async (req,res) => {
        const errors = validationResult(req);

        //if validation failed
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }

        const {name, email,password, indexno} = req.body;


        try {
            // See if user exists

            let userEmail = await User.findOne({email})
            if(userEmail){
                //object array return
                res.status(400).json({errors:[{msg:'User already exists'}]});
            }

            let userIndex = await User.findOne({indexno});
            if(userIndex){
                //object array return
                res.status(400).json({errors:[{msg:'User already exists'}]});
            }

            // Get users gravatar
            const avatar = gravatar.url(email,{
                s:'200',
                r:'pg',
                d:'mm'
            });

            //create user instance
            user = new User({
                name,
                email,
                indexno,
                avatar,
                password
            });

            // Encrypt password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password,salt);

            await user.save();

            // Return jsonwebtoken
            const payload = {
                user : {
                    id : user.id
                }
            }

            jwt.sign(payload,
                config.get('jwtSecret'),
                {expiresIn: 360000},
                (err,token) =>{
                    if(err) throw err;
                    res.json({token});
                }
            );


        } catch (err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
});

// @route  GET api/users
// @desc   Get a user
//@access  Private
router.get('/getuser',auth, async(req,res)=>{
    try{
        const user = await User.findOne({_id:req.user.id});
        console.log(req.user.id);
        if(!user){
            return res.status(400).json({msg:'There is no such user'});
        }
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route  UPDATE api/users
// @desc   Update a user
//@access  Private
router.put('/updateuser',auth, async(req,res)=>{
    try{
        //Update User
        const user= await User.findOne({_id:req.user.id});
        console.log(req.body);
        if(req.body.name){
            user.name=req.body.name;
        }
        if(req.body.email){
            user.email=req.body.email;
        }
        if(req.body.password){
            //Encrypt Password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password,salt);
           
        }
    
        await user.save();
        res.json({msg:'User Updated'});
       
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route  DELETE api/users
// @desc   Delete a user
//@access  Private
router.delete('/deleteuser',auth, async(req,res)=>{
    try{
        //Remove user
        await User.findOneAndRemove({_id:req.user.id});
        //@todo Post Delete
        //@todo Notice Delete
        res.json({msg:'User Deleted'});
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});




module.exports = router;
