// 回答的增删改查
const Router = require('koa-router');
const router = new Router({ prefix: '/questions/:questionId/answers' });

// 引入中间件
const { checkAnswerExists, checkOwner } = require('../middlewares/answer');

// 使用 koa-jwt 插件实现登录状态判断中间件
const koaJWT = require('koa-jwt');
const { JWTSecret } = require('../config');
const auth = koaJWT({ secret: JWTSecret });

// 引入控制器
const { find, create, update, delete:del, findById } = require('../controllers/answer');

router.get('/', find);
router.post('/', auth, create);
router.patch('/:id', auth, checkAnswerExists, checkOwner, update);
router.delete('/:id',auth, checkAnswerExists, checkOwner, del);
router.get('/:id', checkAnswerExists, findById);

module.exports = router;