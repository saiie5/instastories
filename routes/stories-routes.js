const express = require('express');
const {check} = require('express-validator');

const storiesControllers = require('../controllers/stories-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', storiesControllers.getAllStories);

router.get('/:sid', storiesControllers.getStoryById);

router.get('/user/:uid', storiesControllers.getStoriesByUserId);
router.get('/search/:query', storiesControllers.searchStories);
router.use(checkAuth);

router.post(
    '/',
    fileUpload.single('image'),
    [
        check('title')
            .not()
            .isEmpty(),
        check('intro').isLength({min: 5}),
        check('description').isLength({max: 244}),
    ],
    storiesControllers.createStory
);

router.patch(
    '/:sid',
    fileUpload.single('image'),
    [
        check('title')
            .not()
            .isEmpty(),
        check('intro').isLength({min: 5}),
        check('description').isLength({max: 244})
    ],
    storiesControllers.updateStory
);

router.delete('/:sid', storiesControllers.deleteStory);

router.patch('/like/:sid', storiesControllers.likeStory);

router.patch('/unlike/:sid', storiesControllers.unLikeStory);


module.exports = router;