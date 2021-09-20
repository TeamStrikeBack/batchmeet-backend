const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PostSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    posttext:{
        type: String,
        default: null
    },
    image:{
        type: String,
        default: null
    },
    likes:[
        {
            user:{
                type: Schema.Types.ObjectId,
                ref:'users'
            }
        }],
    comments:[
        {
            user:{
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            commenttext:{
                type:String,
                required:true
            },
            date:{
                type: Date,
                default: Date.now
            }
        }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('post',PostSchema);
