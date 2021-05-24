const {Router} = require("express");
const router = Router();
const categoryControllers = require('../controllers/category-controllers');

router.post('/',categoryControllers.createCategory);
router.get('/',categoryControllers.getAllCategories);
router.get('/search/:query',categoryControllers.searchCategory);


module.exports = router;