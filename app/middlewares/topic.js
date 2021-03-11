const Topic = require('../models/topic');

class TopicMiddleware {
    async checkTopicExist(ctx, next) {
        const topic = await Topic.findById(ctx.params.id);
        if (!topic) {
            ctx.throw(404, '话题不存在');
        }
        await next();
    }
}

module.exports = new TopicMiddleware();