const Answer = require('../models/answer');

class AnswerMiddleware {
    async checkAnswerExists(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).populate('answerer') ;
        if (!answer) {
            ctx.throw(404, '答案不存在');
        }
        // 只有在存在 ctx.params.questionId 参数时 才进行下面的校验
        if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
            ctx.throw(404, '该问题下不存在此答案');
        }
        // 将查到的数据进行存储 这样更新数据时 就可以不用查找直接更新了
        ctx.state.answer = answer;
        await next();
    }

    // 判断是否是自己的答案
    async checkOwner(ctx, next) {
        if (ctx.state.answer.answerer._id.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
}

module.exports = new AnswerMiddleware();