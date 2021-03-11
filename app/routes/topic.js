// 主题的增删改查
const Router = require('koa-router');
const router = new Router({prefix: '/topics'});
const { find, findById, create, update, followTopic, unfollowTopic, listFollowingTopics, listTopicFollowers }  = require('../controllers/topic');
// 引入中间件
const { checkTopicExist } = require('../middlewares/topic');
// 换用社区的 koa-jwt 插件作为用户认证和鉴权中间件
const koaJWT = require('koa-jwt');
const { JWTSecret } = require('../config');
const auth = koaJWT({ secret: JWTSecret });

router.get('/', find);
router.post('/', auth, create);
router.get('/:id', findById);
router.patch('/:id', auth, update);

router.get('/listfollowing/:id', listFollowingTopics);
router.put('/follow/:id', auth, checkTopicExist, followTopic);
router.delete('/unfollow/:id', auth, checkTopicExist, unfollowTopic);

router.get('/listfollowers/:id', checkTopicExist, listTopicFollowers);

module.exports = router;