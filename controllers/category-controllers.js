const Category = require('../models/category').model;
const HttpError = require('../models/http-error');

const createCategory = async (req, res, next) => {
    const name = req.body.name.toLowerCase();
    let existingCategory;
    try {
        existingCategory = await Category.findOne({name: name});
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }
    if (existingCategory) {
        const error = new HttpError('It already exists', 400);
        return next(error);
    }
    const newCategory = await Category({
        name
    });

    try {
        await newCategory.save();
    } catch (err) {
        const error = new HttpError(
            err.message,
            500
        );
        return next(error);
    }
    await res.json({category: newCategory});
};


const getAllCategories = async(req, res,next) => {
    let categories;
    try {
        categories = await Category.find();
    } catch (err) {
        const error = new HttpError(
            'Fetching categories failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!categories || categories.length === 0) {
        return next(
            new HttpError('Could not find any categories at the moment.', 404)
        );
    }
    await res.json({
        categories: categories.map(category =>
            category.toObject({getters: true})
        )
    });
};
const searchCategory = async (req, res, next) => {
    const query = req.params.query;
    let results;
    try {
        let agg = Category.aggregate([{
            $search: {
                "text": {
                    "query": query, "path": "name", "fuzzy": {
                        "maxEdits": 1,
                        "maxExpansions": 4,
                    }
                }
            }
        }, {
            $project: {
                "name": 1,
            }
        }]);
        results = await agg.exec();
    } catch (err) {
        const error = new HttpError(err.message, 404);
        return next(error);
    }
    if (results.length === 0) {
        await res.json({results: "No results found!!"});
    } else {
        await res.json({results: results});
    }

};
exports.searchCategory = searchCategory;
exports.createCategory = createCategory;
exports.getAllCategories = getAllCategories;