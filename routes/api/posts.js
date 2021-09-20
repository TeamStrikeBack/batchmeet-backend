const express = require('express');
const router = express.Router();
const {check, validationResult, param} = require('express-validator');


//token checking middleware
const auth = require('../../middleware/authMiddleware');

//admin middleware
const admin = require('../../middleware/adminMiddleware');

//Import DB Schemas
const User = require('../../models/User');
const Post = require('../../models/Post');





// @route  GET api/post
// @desc   Test route
//@access  Public
//router.get('/',(req,res) => res.send('Post route'));


// @route  POST api/posts
// @desc   Create post
//@access  Private
router.post('/',auth,async (req,res) => {
    //not added validation part

    try{

        const newPost = new Post({
            user: req.user.id,
            posttext: req.body.posttext,
        });


        const post = await newPost.save();
        if(post){
            return res.status(200).json({msg:'Post Added Successfully'})
        }else {
            return res.status(500).json({msg: 'Something Went Wrong'});
        }

    }catch (err){
        console.error(err.message);
        return res.status(500).send('Server Error');
    }

});


// @route  GET api/posts
// @desc   Get all posts
//@access  Private
router.get('/', auth, async (req, res) => {
    try {
        console.log(admin(req,res));
        const posts = await Post.find().sort({date: -1});
        return res.json(posts);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});


// @route  GET api/posts/:id
// @desc   Get post by ID
//@access  Private
router.get('/:id',auth,async (req,res) =>{

    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(500).json({msg: 'Post not Found'});
        }

        return res.json(post);

    }catch (err){
        console.error(err.message);
        return res.status(500).json({msg:'Server Error'});
    }
});


// @route  DELETE api/posts/:id
// @desc   Delete a post
//@access  Private
router.delete('/:id',auth, async (req,res) =>{

    try{

        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(500).json({msg:'Post not found'});
        }


        //Check user.id == post.user.id
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg:'User not authorized'});
        }

        await post.remove();
        return res.status(200).json({msg:'Post Removed Successfully'});


    }catch (err){
        console.error(err.message);
        return res.status(500).json('Server Error');
    }
});


// @route  PUT api/posts/:id
// @desc   Update a post
//@access  Private
router.put('/:id',auth,async (req,res) =>{

    try{
        const {posttext} = req.body;

        const post = await Post.findById(req.params.id);

        //Check user.id == post.user.id
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg:'User not authorized'});
        }

        if(post){
            post.posttext = posttext
            const updatedPost = await post.save();
            return res.status(200).json(updatedPost);
        }else{
            return res.status(404).json({msg:'Post not found'});
        }

    }catch (err){
        console.error(err.message);
        return res.status(500).json('Server Error');
    }



});




module.exports = router;
