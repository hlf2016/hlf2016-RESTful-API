// 回答的增删改查
const Router = require('koa-router');
const router = new Router({ prefix: '/questions/:questionId/answers/:answerId/comments' });

// 引入中间件
const { checkCommentExists, checkOwner } = require('../middlewares/comment');

// 使用 koa-jwt 插件实现登录状态判断中间件
const koaJWT = require('koa-jwt');
const { JWTSecret } = require('../config');
const auth = koaJWT({ secret: JWTSecret });

// 引入控制器
const { find, create, update, delete:del, findById } = require('../controllers/comment');

router.get('/', find);
router.post('/', auth, create);
router.patch('/:id', auth, checkCommentExists, checkOwner, update);
router.delete('/:id',auth, checkCommentExists, checkOwner, del);
router.get('/:id', checkCommentExists, findById);

module.exports = router;