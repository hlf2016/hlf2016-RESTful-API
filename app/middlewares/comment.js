const Comment = require('../models/comment');

class CommentMiddleware {
    async checkCommentExists(ctx, next) {
        const comment = await Comment.findById(ctx.params.id).populate('commentator') ;
        if (!comment) {
            ctx.throw(404, '答案不存在');
        }
        // 只有在存在 ctx.params.questionId 参数时 才进行下面的校验
        if (ctx.params.questionId && comment.questionId !== ctx.params.questionId) {
            ctx.throw(404, '该问题下不存在此评论');
        }
        // 只有在存在 ctx.params.answerId 参数时 才进行下面的校验
        if (ctx.params.answerId && comment.answerId !== ctx.params.answerId) {
            ctx.throw(404, '该回答下不存在此评论');
        }
        // 将查到的数据进行存储 这样更新数据时 就可以不用查找直接更新了
        ctx.state.comment = comment;
        await next();
    }

    // 判断是否是自己的评论
    async checkOwner(ctx, next) {
        if (ctx.state.comment.commentator._id.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
}

module.exports = new CommentMiddleware();