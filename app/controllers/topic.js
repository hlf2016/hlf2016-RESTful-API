const question = require('../models/question');
const Topic = require('../models/topic');
const User = require('../models/user');

class TopicController {
    async find(ctx) {
        // 当前页码
        // 此处 *1 是为了转化为整型
        const page  = Math.max(ctx.query.page * 1, 1);
        // 每页展示的数据条数 默认10个 
        const { per_page = 10 } = ctx.query;
        const perPage = Math.max( per_page * 1, 1);
        // 正则匹配进行模糊搜索
        ctx.body = await Topic.find({name: new RegExp(ctx.query.q)}).limit(perPage).skip(perPage * (page - 1));
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +'+f).join('');
        const topic = await Topic.findById(ctx.params.id).select(selectFields) ;
        ctx.body = topic;
    }

    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false }
        });
        const topic = await new Topic(ctx.request.body).save();
        ctx.body = topic;
    }

    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required:false },
            avatar_url: { type: 'string', required:false },
            introduction: { type: 'string', required:false }
        });
        const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        ctx.body = topic;
    }

    // 关注话题
    async followTopic(ctx) {
        const currentUser = await User.findById(ctx.state.user._id).select('+followingTopics');
        // 因为model中的字段配置 currentTopic 中的话题id 默认是 Schema.Types.ObjectId 类型的 需要转化成字符串
        if (!currentUser.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            currentUser.followingTopics.push(ctx.params.id);
            currentUser.save();
        }
        // 表示操作成功但是无数据返回
        ctx.body = 204;
    }

    // 取消关注话题
    async unfollowTopic(ctx) {
        const currentUser = await User.findById(ctx.state.user._id).select('+followingTopics');
        // 找到要取消关注的Topic id 在 followingTopics 中的索引位置
        // 因为model中的字段配置 currentTopic 中的Topic id 默认是 Schema.Types.ObjectId 类型的 需要转化成字符串
        const index = currentUser.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
        // index 大于 -1 说明存在这个话题 否则压根不存在
        if (index > -1) {
            currentUser.followingTopics.splice(index, 1);
            currentUser.save();
        }
        // 表示操作成功但是无数据返回
        ctx.body = 204;
    }

    // 用户关注列表
    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.followingTopics;
    }

    // 获取话题的粉丝列表
    async listTopicFollowers(ctx) {
        const followers = await User.find({ followingTopics: ctx.params.id });
        ctx.body = followers;
    }
}

module.exports = new TopicController();