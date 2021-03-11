// 程序入口文件
// package.json 里面
// "scripts": {
//      "start": "nodemon app"
//  },
// nodemon app 是 nodemon app/index.js 的简写
const Koa = require('koa');
const app = new Koa();

const path = require('path');

// 引入请求body数据解析模块
const koaBody = require('koa-body');
// 引入批量路由注册
// 实际引入的文件为 ./routes/index.js 即路由入口文件
const routing  = require('./routes');
// 引入推荐错误处理插件 koa-json-error 此插件可以将任意错误以json格式返回 包括404错误
const jsonError = require('koa-json-error');
// 引入参数校验中间件
const parameter = require('koa-parameter');
// 引入 mongoose 操作 mongodb
const mongoose = require('mongoose');
// 引入配置文件
const { connect } = require('./config');
// 引入 koa-static 将上传后的图片路径转化为可以访问的url链接
const koaStatic = require('koa-static');

mongoose.connect(connect, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false,
    useCreateIndex: true
}, () => console.log('mongodb 连接成功'));
mongoose.connection.on('error', console.error);

// 自制中间件 用于将错误返回为json格式
// 缺陷很明显 无法捕捉404错误 且格式不统一

// app.use(async (ctx, next) => {
//     try {
//         await next();
//     }catch(err) {
//         ctx.status = err.status||err.statusCode||500;
//         ctx.body = {
//             message: err.message
//         }
//     }
// });

// 使用 koa-json-error 中间件
// app.use(jsonError()); // 这种方式会将错误的堆栈信息一并反馈给客户端 即 stack 字段 仅适用于开发场景
app.use(jsonError({
    // 这里 {stack, ...rest} 是对默认返回数据的一个解构  一部分是 stack 信息 另一部分是其他信息 如果是生产环境我们需要除去堆栈信息
    postFormat: (err, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest: {stack, ...rest}
}));
// 使用bodyparser
app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true
    }
}));
// 使用 koa-static
app.use(koaStatic(path.join(__dirname, 'public')));

// 使用路由批量载入
routing(app);
// 使用koa-parameter
app.use(parameter(app));
app.listen(3000, () => {
    console.log('serve started at http://localhost:3000');
});