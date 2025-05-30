const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User').schema

const Post = new Schema({
    title: {
        type: String, 
        required: true
    },
    desc: {
        type: String, 
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Post', Post);