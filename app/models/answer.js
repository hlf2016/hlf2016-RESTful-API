const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const answerModel = new Schema({
    // select:false 返回数据时 不携带冗余的__v字段信息
    __v: {type: Number, select:false},
    content: {type: String, required: true},
    answerer: { type: Schema.Types.ObjectId, ref:'User', required: true },
    questionId: {type: String, required: true},
    likeCount: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = model('Answer', answerModel);