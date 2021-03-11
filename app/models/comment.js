const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const commentModel = new Schema({
    // select:false 返回数据时 不携带冗余的__v字段信息
    __v: {type: Number, select:false},
    content: {type: String, required: true},
    commentator: { type: Schema.Types.ObjectId, ref:'User', required: true },
    questionId: {type: String, required: true},
    answerId: {type: String, required: true},
    rootCommentId: {type: String},
    replyTo: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = model('Comment', commentModel);