// 路由入口文件 读取当前目录 自动化引入除index.js外的所有路由模块 实现路由批量注册
const fs = require('fs');

module.exports = (app) => {
    fs.readdirSync(__dirname).forEach(file => {
        // 如果是当前文件即路由入口文件则忽略
        if (file === 'index.js') {
            return;
        }
        const route = require(`./${file}`);
        // 使用 route.allowedMethods() 对未实现的方法和请求方式做出反馈
        app.use(route.routes()).use(route.allowedMethods());
    });
}
