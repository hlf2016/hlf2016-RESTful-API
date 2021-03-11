const Question = require('../models/question');
const User = require('../models/user');

class QuestionController {
    async find(ctx) {
        // 当前页码
        // 此处 *1 是为了转化为整型
        const page  = Math.max(ctx.query.page * 1, 1);
        // 每页展示的数据条数 默认10个 
        const { per_page = 10 } = ctx.query;
        const perPage = Math.max( per_page * 1, 1);
        // 正则匹配进行模糊搜索
        const q = new RegExp(ctx.query.q);
        ctx.body = await Question.find({ $or: [{ title: q }, { description: q }] }).limit(perPage).skip(perPage * (page - 1));
    }

    async findById(ctx) {
        const  { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +'+f).join('');
        const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics');
        ctx.body = question;
    }

    async create(ctx) {
        ctx.verifyParams({
            title: { type: 'string',  required: true },
            description: { type: 'string', required: false },
        });
        const question = await new Question({ ...ctx.request.body, questioner: ctx.state.user._id }).save();
        ctx.body = question;
    }

    async update(ctx) {
        ctx.verifyParams({
            title: { type: 'string',  required: false },
            description: { type: 'string', required: false },
        });
        // const question = await Question.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        // 因为在之前的 checkQuestionExists 中已经对问题对象进行存储映射 此处不必再次查找 直接更新即可
        await ctx.state.question.update(ctx.request.body);
        ctx.body = ctx.state.question;
    }

    async delete(ctx) {
        await Question.findByIdAndDelete(ctx.params.id);
        ctx.status = 204;
    }

    // 获取指定用户的问题列表
    async listUserQuestions(ctx) {
        const questions = await Question.find({ questioner: ctx.params.id });
        ctx.body = questions;
    }

     // 获取指定话题的问题列表
     async listTopicQuestions(ctx) {
        const questions = await Question.find({ topics: ctx.params.id });
        ctx.body = questions;
    }
}

module.exports = new QuestionController;