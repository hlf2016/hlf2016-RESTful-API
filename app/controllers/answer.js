const Answer = require('../models/answer');

class AnswerController {
    async find(ctx) {
        // 当前页码
        // 此处 *1 是为了转化为整型
        const page  = Math.max(ctx.query.page * 1, 1);
        // 每页展示的数据条数 默认10个 
        const { per_page = 10 } = ctx.query;
        const perPage = Math.max( per_page * 1, 1);
        // 正则匹配进行模糊搜索
        const q = new RegExp(ctx.query.q);
        ctx.body = await Answer.find({ content: q, questionId: ctx.params.questionId }).limit(perPage).skip(perPage * (page - 1));
    }

    async findById(ctx) {
        const  { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +'+f).join('');
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer');
        ctx.body = answer;
    }

    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string',  required: true }
        });
        const answer = await new Answer({ ...ctx.request.body, answerer: ctx.state.user._id, questionId: ctx.params.questionId }).save();
        ctx.body = answer;
    }

    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string',  required: true }
        });
        await ctx.state.answer.update(ctx.request.body);
        ctx.body = ctx.state.answer;
    }

    async delete(ctx) {
        await Answer.findByIdAndDelete(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new AnswerController;