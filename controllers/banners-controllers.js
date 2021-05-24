const Banner = require('../models/banner');
const HttpError = require('../models/http-error');

const getAllBanners = async (req, res, next) => {
    let Banners;
    try {
        Banners = await Banner.find();
    } catch (err) {
        const error = new HttpError(
            'Fetching Banners failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!Banners || Banners.length === 0) {
        return next(
            new HttpError('Could not find any Banners at the moment.', 404)
        );
    }
    await res.json({
        banners: Banners.map(banner =>
            banner.toObject({getters: true})
        )
    });
};
const getBanner = async (req, res, next) => {
    const bannerId = req.params.bid;
    let banner;
    try {
        banner = await Banner.findById(bannerId);
    } catch (err) {
        const error = new HttpError(err.message, 404);
        return next(error);
    }
    if (!banner) {
        const error = new HttpError("No banner for this id!", 404);
        return next(error);
    }
    await res.json({banner: banner});

};


exports.getAllBanners = getAllBanners;
exports.getBanner = getBanner;
