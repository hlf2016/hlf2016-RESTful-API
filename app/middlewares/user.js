// 引入 jwt 和 jwtsecret 对认证信息进行解密
const JWT = require('jsonwebtoken');
const { JWTSecret } = require('../config');
const User = require('../models/user');

class UserMiddleware {
    // 自己实现用户认证中间件
    async auth (ctx, next) {
        // Bearer token 就存放在请求的头部 这里解构获取相应信息
        // 给 authorization 一个默认空字符串的值 防止头部不存在此字段信息时 导致下面流程错误
        const { authorization = '' } = ctx.request.header;
        const token = authorization.replace('Bearer ', '');
        try {
            const user = JWT.verify(token, JWTSecret);
            // 将用户信息挂载到上下文对象中
            ctx.state.user = user;
        } catch(err) {
            // 401 授权失败
            ctx.throw(401, err.message);
        }

        // 继续执行后续流程
        await next();
    }

    // 自己实现用户鉴权中间件
    // 限制只能自己改自己数据的中间件
    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) {
            // 如果当前被操作的数据的拥有者跟当前用户不一致的话 提示没有权限
            ctx.throw(403, '没有权限');
        }
        await next();
    } 

    // 判断用户是否存在 的中间件
    async checkUserExists(ctx, next) {
        const user = await User.findById(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        await next();
    }
}

module.exports =new UserMiddleware();