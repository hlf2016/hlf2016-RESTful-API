const User = require('../models/user');
const Answer = require('../models/answer');
const JWT = require('jsonwebtoken');
// 引入 JWT 数据加密密钥
const { JWTSecret } = require('../config');

class UserController {
    async find(ctx) {
        // 当前页码
        // 此处 *1 是为了转化为整型
        const page  = Math.max(ctx.query.page * 1, 1);
        // 每页展示的数据条数 默认10个 
        const { per_page = 10 } = ctx.query;
        const perPage = Math.max( per_page * 1, 1);
        ctx.body = await User.find({name: new RegExp(ctx.query.q)}).limit(perPage).skip(perPage * (page - 1));
    }

    async findById(ctx) {
        // 自己做的参数校验
        // if (ctx.params.id >= db.length) {
        //     ctx.throw(412);
        // }

        // 可以根据自己的需求 通过传入参数的方式 来控制展示的信息字段
        // 参数形式为 ?fields=educations;gender;graduation_year
        const { fields='' } = ctx.query;
        // 查询拼接需要的查询格式字符串 样例：+educations +gender +graduation_year  注意各参数中间的空格
        // filter 是用来过滤空查询 map 是遍历 join 是合并
        const selectFields = fields.split(';').filter(f => f).map(f => ' +'+f).join('');
        const user = await User.findById(ctx.params.id).select(selectFields).populate('following locations business').populate({
            path: 'educations',
            populate: { path: 'major school' }
        }).populate({
            path: 'employments',
            populate: { path: 'company job' }
        }); 
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user;
    }

    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        });
        // 创建新用户时，查看当前是否已经存在该用户
        const { name } = ctx.request.body;
        const repeatUser = await User.findOne({ name });
        if (repeatUser) {
            // 如果存在将被添加的用户 则报错 冲突的规定报错码时 409
            ctx.throw(409, '用户已存在');
        }
        const user = await new User(ctx.request.body).save();
        // rest 最佳实践要求将修改的内容进行返回展示
        ctx.body = user;
    }

    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            locations: { type: 'array', itemType: 'string', required: false },
            business: { type: 'string', required: false},
            employments: { type: 'array', itemType: 'object', required: false },
            educations: { type: 'array', itemType: 'object', required: false }
        });
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user;
    }

    async delete(ctx) {      
        const user = await User.findByIdAndRemove(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        // rest 最佳实践要求我们 删除必返回 204
        ctx.status = 204;
    }

    async login(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        });
        const user = await User.findOne(ctx.request.body);
        if (!user) {
            ctx.throw(401, '用户名或者密码错误');
        }
        const { _id, name } = user;
        const token = JWT.sign({ _id, name }, JWTSecret, { expiresIn: '1d' });;
        ctx.body = { token };
    }

    // 获取指定用户关注的用户列表
    async listFollowing(ctx) {
        // 获取当前用户的信息 包括 粉丝信息
        const user = await User.findById(ctx.params.id).select('+following').populate('following');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.following;
    }

    // 获取用户粉丝列表
    async listFollowers(ctx) {
        const followers = await User.find({ following: ctx.params.id });
        ctx.body = followers;
    }

    // 关注用户
    async follow(ctx) {
        const currentUser = await User.findById(ctx.state.user._id).select('+following');
        // 因为model中的字段配置 currentUser 中的用户id 默认是 Schema.Types.ObjectId 类型的 需要转化成字符串
        if (!currentUser.following.map(id => id.toString()).includes(ctx.params.id)) {
            currentUser.following.push(ctx.params.id);
            currentUser.save();
        }
        // 表示操作成功但是无数据返回
        ctx.body = 204;
    }

    // 取消关注用户
    async unfollow(ctx) {
        const currentUser = await User.findById(ctx.state.user._id).select('+following');
        // 找到要取消关注的用户id 在 following 中的索引位置
        // 因为model中的字段配置 currentUser 中的用户id 默认是 Schema.Types.ObjectId 类型的 需要转化成字符串
        const index = currentUser.following.map(id => id.toString()).indexOf(ctx.params.id);
        // index 大于 -1 说明存在这个用户 否则压根不存在
        if (index > -1) {
            currentUser.following.splice(index, 1);
            currentUser.save();
        }
        // 表示操作成功但是无数据返回
        ctx.body = 204;
    }

    // 点赞的答案列表
    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+likeAnswers').populate('likeAnswers');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.likeAnswers;
    }

    // 点赞
    // 为了制造互斥关系 需要做成中间件
    async likeAnswer(ctx, next) {
        const user = await User.findById(ctx.state.user._id).select('+likeAnswers');
        // 判断当前登录用户顶的答案列表中是否已经包含 目标答案 没有的话 添加进去
        // 这里需要对id 进行字符串转化
        if (!user.likeAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            user.likeAnswers.push(ctx.params.id);
            user.save();
            // 对 答案 的点赞数加1
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { likeCount: 1 } });
        }
        ctx.status = 204;
        await next();
    }

    // 取消赞
    async unlikeAnswer(ctx) {
        const user = await User.findById(ctx.state.user._id).select('+likeAnswers');
        const index = user.likeAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            user.likeAnswers.splice(index, 1);
            user.save();
            // 对 答案 的点赞数减1
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { likeCount: -1 } });
        }
        ctx.status = 204;
    }

    // 踩的答案列表
    async listDislikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+dislikeAnswers').populate('dislikeAnswers');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.dislikeAnswers;
    }

    // 踩答案
    // 为了制造互斥关系 需要做成中间件
    async dislikeAnswer(ctx, next) {
        const user = await User.findById(ctx.state.user._id).select('+dislikeAnswers');
        if (!user.dislikeAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            user.dislikeAnswers.push(ctx.params.id);
            user.save();
        }
        ctx.status = 204;
        await next();
    }

    // 取消踩答案
    async unDislikeAnswer(ctx) {
        const user = await User.findById(ctx.state.user._id).select('+dislikeAnswers');
        const index = user.dislikeAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            user.dislikeAnswers.splice(index, 1);
            user.save();
        }
        ctx.status = 204;
    }


    // 获取用户收藏的答案列表
    async listCollectedAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+collectedAnswers').populate('collectedAnswers'); 
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.collectedAnswers;
    }

    // 收藏答案
    async collectAnswer(ctx) {
        const user = await User.findById(ctx.state.user._id).select('+collectedAnswers');
        if (! user.collectedAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            user.collectedAnswers.push(ctx.params.id);
            user.save();
        }
        ctx.status = 204;
    }

    // 取消收藏答案
    async uncollectAnswer(ctx) {
        const user = await User.findById(ctx.state.user._id).select('+collectedAnswers');
        const index = user.collectedAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            user.collectedAnswers.splice(index, 1);
            user.save();
        }
        ctx.status = 204;
    }

}

module.exports = new UserController();