const {Router} = require('express');
const bannersController = require('../controllers/banners-controllers');

const router = new Router();

router.get('/', bannersController.getAllBanners);
router.get('/:bid', bannersController.getBanner);

module.exports = router;