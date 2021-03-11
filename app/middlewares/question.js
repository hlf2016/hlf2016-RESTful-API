const Question = require('../models/question');

class QuestionMiddleware {
    async checkQuestionExists(ctx, next) {
        const question = await Question.findById(ctx.params.id).populate('questioner') ;
        if (!question) {
            ctx.throw(404, '问题不存在');
        }
        // 将查到的数据进行存储 这样更新数据时 就可以不用查找直接更新了
        ctx.state.question = question;
        await next();
    }

    // 判断是否是自己的问题
    async checkOwner(ctx, next) {
        // console.log(typeof ctx.state.question.questioner._id)
        // console.log(typeof ctx.state.question.questioner._id.toString())
        if (ctx.state.question.questioner._id.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
}

module.exports = new QuestionMiddleware();