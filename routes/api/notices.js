const express = require('express');
const router = express.Router();



//Import middlewares
const auth = require('../../middleware/authMiddleware');
const admin = require('../../middleware/adminMiddleware');

//import Models
const Notice = require('../../models/Notice');
const Post = require("../../models/Post");


// @route  GET api/post
// @desc   Test route
//@access  Public
//router.get('/',(req,res) => res.send('Notice route'));


// @route  POST api/notices
// @desc   Create a notice
//@access  Private
router.post('/',auth, async (req,res) =>{

    try{

        //@todo - need to check date type with react

        const newNotice = new Notice({
            user:req.user.id,
            content: req.body.content,
            type: req.body.type,

            examdate: req.body.exam_date,
            deadline: req.body.dead_line,
            eventdate: req.body.event_date
        });


        const notice = await newNotice.save();

        if(notice){
            return res.status(200).json({msg:'Notice Added Successfully'})
        }else {
            return res.status(500).json({msg: 'Something Went Wrong'});
        }

    }catch (err){
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});


// @route  GET api/notices
// @desc   GET all notices
//@access  Private
router.get('/',auth, async (req,res) =>{

    try{

        const notices = await Notice.find().sort({postedtime:-1});

        return res.status(200).json(notices);

    }catch (err){
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});


// @route  GET api/notices/:id
// @desc   Get notice by ID
//@access  Private
router.get('/:id',auth,async (req,res) =>{

    try {
        const notice = await Notice.findById(req.params.id);

        if(!notice){
            return res.status(500).json({msg: 'Notice not Found'});
        }

        return res.json(notice);

    }catch (err){
        console.error(err.message);
        return res.status(500).json({msg:'Server Error'});
    }
});


// // @route  PUT api/notices/:id
// // @desc   Edit notices
// //@access  Private
// router.put('/:id',auth,async (req,res) =>{
//
//     try{
//
//         //find notice
//         const notice = await Notice.findById(req.params.id);
//
//
//         //edit notice
//
//         //save to DB
//
//
//     }catch (err){
//         console.error(err.message);
//         return res.status(500).send('Server Error');
//     }
// });


// @route  DELETE api/posts/:id
// @desc   Delete a post
//@access  Private
router.delete('/:id',auth,async (req,res) =>{

    try{

        const notice = await Notice.findById(req.params.id);

        if(!notice){
            return res.status(500).json({msg:'Notice not found'});
        }

        //Check user.id == post.user.id
        if(notice.user.toString() !== req.user.id){
            return res.status(401).json({msg:'User not authorized'});
        }

        await notice.remove();
        return res.status(200).json({msg:'Notice Removed Successfully'});


    }catch (err){
        console.log(err.message);
        return res.status(500).send('Server Error');
    }
});






module.exports  = router;
