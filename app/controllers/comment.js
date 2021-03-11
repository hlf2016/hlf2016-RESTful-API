const Comment = require('../models/comment');

class CommentController {
    async find(ctx) {
        // 当前页码
        // 此处 *1 是为了转化为整型
        const page  = Math.max(ctx.query.page * 1, 1);
        // 每页展示的数据条数 默认10个 
        const { per_page = 10 } = ctx.query;
        const perPage = Math.max( per_page * 1, 1);
        // 正则匹配进行模糊搜索
        const q = new RegExp(ctx.query.q);
        const { questionId, answerId } = ctx.params;
        const { rootCommentId } = ctx.query;
        ctx.body = await Comment
                .find({ content: q, questionId, answerId, rootCommentId })
                .limit(perPage)
                .skip(perPage * (page - 1))
                .populate('commentator replyTo');
    }

    async findById(ctx) {
        const  { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +'+f).join('');
        const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator');
        ctx.body = comment;
    }

    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string',  required: true },
            rootCommentId: { type: 'string', required: false },
            replyTo: { type: 'string',  required: false },
        });
        const commentator = ctx.state.user._id;
        const { questionId, answerId } = ctx.params;
        const comment = await new Comment({ ...ctx.request.body, commentator, questionId, answerId }).save();
        ctx.body = comment;
    }

    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string',  required: true }
        });
        // 只允许更新评论的 content 属性
        const { content } = ctx.request.body;
        await ctx.state.comment.update({ content });
        ctx.body = ctx.state.comment;
    }

    async delete(ctx) {
        await Comment.findByIdAndDelete(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new CommentController;