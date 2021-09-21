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
        //console.log(admin(req,res));
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



// @route  POST api/posts/comment/:id
// @desc   Comment on a post
//@access  Private
router.put('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(500).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            commenttext: req.body.text,
            name: user.name,
            user: req.user.id,
        };

        post.comments.unshift(newComment);
        await post.save();

        return res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});



// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Delete comment
//@access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        //Get the post
        const post = await Post.findById(req.params.id);

        //Pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        //Make sure comment exist
        if (!comment) {
            return res.status(404).json({msg: 'Comment does not exist'});
        }

        //Check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized'});
        }

        //Get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.params.id);

        //remove comment
        post.comments.splice(removeIndex, 1);

        //post object save to DB
        await post.save();

        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});


//@route PUT api/posts/edit/comment/:id/:comment_id
//@desc Update comment
//access Private
router.put('/edit/comment/:id/:comment_id',auth,async (req,res) =>{

    try{

        //get the post
        const post = await Post.findById(req.params.id);

        //if post not found
        if(!post){
            return res.status(404).json({msg: "Post not found"});
        }

        //find the comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        //if comment not found
        if(!comment){
            return res.status(404).json({msg: "Comment not found"});
        }

        //Check user.id == post.user.id
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg:'User not authorized'});
        }


        const newComment = {
            commenttext: req.body.text,
            user: req.user.id,
        };


        //Get update index
        const updateIndex = post.comments.map(comment => comment.id.indexOf(req.params.comment_id));


        //remove comment
        post.comments.splice(removeIndex,1, newComment);

        await post.save();
        return res.status(200).json(post.comments);

    }catch (err){
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});



// @route  PUT api/posts/like/:id
// @desc   Like a post
//@access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Check if the post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({msg: 'Post already liked'});
        }

        //Like push method. unshift add beginning
        post.likes.unshift({user: req.user.id});

        //save to DB
        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Sever Error');
    }
});


// @route  PUT api/posts/unlike/:id
// @desc   Unlike a post
//@access  Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Check if the post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({msg: 'Post has not yet been liked'});
        }

        //Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.params.id);

        //
        post.likes.splice(removeIndex, 1);

        //save to DB
        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Sever Error');
    }
});





module.exports = router;
