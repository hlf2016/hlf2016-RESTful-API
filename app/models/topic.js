const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const topicSchema = new Schema({
    // select:false 返回数据时 不携带冗余的__v字段信息
    __v: {type: Number, select:false},
    // 话题名称
    name: {type: String, required: true},
    // 话题封面图
    avatar_url: {type: String},
    // 话题描述
    introduction: {type: String, select: false}
}, { timestamps: true });

module.exports = model('Topic', topicSchema);