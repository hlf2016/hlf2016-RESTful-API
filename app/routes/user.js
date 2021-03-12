// 用户的增删改查
const Router = require('koa-router');
const router = new Router({prefix: '/users'});
const { find, findById, create, update, delete: del, login, listFollowing, follow, unfollow, listFollowers, listLikingAnswers, likeAnswer, listDislikingAnswers, dislikeAnswer, unDislikeAnswer, unlikeAnswer, listCollectedAnswers, collectAnswer, uncollectAnswer } = require('../controllers/user');
// 引入自己写的用户认证和鉴权中间件
// 因为用了 koa-jwt 插件作为用户认证中间件 故不再用自己写的 auth 中间件
// const { auth, checkOwner } = require('../middlewares/user');
const { checkOwner, checkUserExists } = require('../middlewares/user');

const { checkAnswerExists } = require('../middlewares/answer');

// 换用社区的 koa-jwt 插件作为用户认证和鉴权中间件
const koaJWT = require('koa-jwt');
const { JWTSecret } = require('../config');
const auth = koaJWT({ secret: JWTSecret });

router.get('/', find);
// post 为提交数据
router.post('/', create);
router.get('/:id', findById);
// 更新数据 put 为全量更新 patch 为 部分更新
// router.put('/:id', update);
router.patch('/:id', auth, checkOwner, update);
router.delete('/:id',auth, checkOwner, del);
router.post('/login', login);
// 获取指定用户当前关注的用户列表
router.get('/:id/following', listFollowing);
// 获取用户的粉丝列表
router.get('/:id/followers', listFollowers);
// 关注用户
router.put('/follow/:id', auth, checkUserExists, follow);
// 取关
router.delete('/unfollow/:id', auth, checkUserExists, unfollow);

// 赞答案
router.get('/:id/likeanswers', listLikingAnswers);
// 为了制造互斥关系 需要做成中间件 只要赞了 就取消踩
router.get('/likeanswer/:id', auth, checkAnswerExists, likeAnswer, unDislikeAnswer);
router.get('/unlikeanswer/:id', auth, checkAnswerExists, unlikeAnswer);

// 踩答案
router.get('/:id/dislikeanswers', listDislikingAnswers);
// 为了制造互斥关系 需要做成中间件 只要踩了 就取消赞
router.get('/dislikeanswer/:id', auth, checkAnswerExists, dislikeAnswer, unlikeAnswer);
router.get('/undislikeanswer/:id', auth, checkAnswerExists, unDislikeAnswer);

// 答案收藏管理
router.get('/:id/listcollectedanswers', listCollectedAnswers);
router.get('/collectanswer/:id', auth, checkAnswerExists, collectAnswer);
router.get('/uncollectanswer/:id', auth, checkAnswerExists, uncollectAnswer);

module.exports = router;