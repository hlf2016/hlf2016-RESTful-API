const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: {type: String, required: true},
    // select:false 返回数据时 不携带密码字段
    password: {type: String, required: true, select: false},
    // select:false 返回数据时 不携带冗余的__v字段信息
    __v: {type: Number, select:false},
    avatar_url: {type: String},
    gender: {type: String, enum: ['male', 'female'], default: 'male', select: false},
    headline: {type: String},
    // 字符串数组
    locations: {type: [{type: Schema.Types.ObjectId, ref: 'Topic'}], select: false},
    business: {type: Schema.Types.ObjectId, ref: 'Topic' ,select: false},
    employments: {
        type: [{
            company: { type: Schema.Types.ObjectId, ref: 'Topic' },
            job: { type:Schema.Types.ObjectId, ref: 'Topic' }
        }],
        select: false
    },
    educations: {
        type: [{
            school: {type: Schema.Types.ObjectId, ref: 'Topic'},
            major: {type: Schema.Types.ObjectId, ref: 'Topic'},
            // 学位
            diploma: {type: Number, enum: [1,2,3,4,5]},
            entrance_year: {type: Number},
            graduation_year: {type: Number}
        }]
        , select: false
    },
    following: {
        type: [{
            type: Schema.Types.ObjectId,
            // ref 可以使用 populate 方便滴拿到用户信息
            ref: 'User'
        }],
        select: false
    },
    followingTopics: {
        type: [{
            type: Schema.Types.ObjectId,
            // ref 可以使用 populate 方便滴拿到用户信息
            ref: 'Topic'
        }],
        select: false
    },
    likeAnswers: { 
        type: [{ 
            type: Schema.Types.ObjectId, ref: 'Answer' 
        }],
        select: false
    },
    dislikeAnswers: { 
        type: [{ 
            type: Schema.Types.ObjectId, ref: 'Answer' 
        }],
        select: false
    },
    collectedAnswers: {
        type: [{
            type: Schema.Types.ObjectId, ref: 'Answer'
        }],
        select: false
    }
}, { timestamps: true });

module.exports = model('User', userSchema);