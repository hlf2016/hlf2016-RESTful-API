// 问题的增删改查
const Router = require('koa-router');
const router = new Router({ prefix: '/questions' });

// 引入中间件
const { checkQuestionExists, checkOwner } = require('../middlewares/question');

// 使用 koa-jwt 插件实现登录状态判断中间件
const koaJWT = require('koa-jwt');
const { JWTSecret } = require('../config');
const auth = koaJWT({ secret: JWTSecret });

// 引入控制器
const { find, create, update, delete:del, listUserQuestions, findById, listTopicQuestions } = require('../controllers/question');

router.get('/', find);
router.post('/', auth, create);
router.patch('/:id', auth, checkQuestionExists, checkOwner, update);
router.delete('/:id',auth, checkQuestionExists, checkOwner, del);

router.get('/user/:id', listUserQuestions);
router.get('/topic/:id', listTopicQuestions);
router.get('/:id', findById);

module.exports = router;