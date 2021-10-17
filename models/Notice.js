const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const NoticeSchema = new Schema({

    user:{
        type: Schema.Types.ObjectId,
        ref:'users'
    },

    content:{
        type:String,
        required: true
    },

    postedtime:{
        type: Date,
        default: Date.now
    },

    type:{
        type: String,
        required: true
    },

    //if it is Exam type notice
    examdate:{
        type: Date,
        default: null
    },

    //if it is Assignment type notice
    deadline:{
        type: Date,
        default: null
    },

    //if it is event type notice
    eventdate:{
        type: Date,
        default: null
    }

});

module.exports = Notice = mongoose.model('notice',NoticeSchema);
