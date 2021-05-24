const {Router} = require('express');
const followController = require('../controllers/follow-controllers');
const checkAuth = require('../middleware/check-auth');

const router = Router();

router.get('/followers/:uid', followController.getFollowers);
router.get('/following/:uid', followController.getFollowing);
router.use(checkAuth);
router.post('/:uid', followController.follow);
router.post('/unfollow/:uid', followController.unFollow);

module.exports = router;