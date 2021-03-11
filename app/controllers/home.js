const path = require('path');
class HomeController {
    index(ctx) {
        // 模拟手动抛出错误
        // ctx.throw(403);
        ctx.body = '<h1>这是主页</h1>';
    }

    // 上传文件
    upload(ctx) {
        const file = ctx.request.files.file;
        // 这种做法会导致返回的是 文件的绝对路径
        // ctx.body = { path: file.path };

        // path.basename 传入 绝对路径 返回 basename 也就 文件名.后缀名格式
        const basename = path.basename(file.path);
        ctx.body = { url: `${ctx.origin}/uploads/${basename}` };
    }
}

module.exports = new HomeController();