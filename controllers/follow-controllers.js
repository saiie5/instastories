const HttpError = require('../models/http-error');
const User = require('../models/user');
const mongoose = require('mongoose');

const getFollowers = async (req, res, next) => {
    let userWithFollowers;
    const userId = req.params.uid;
    try {
        userWithFollowers = await User.findById(userId).populate('followers');
    } catch (err) {
        const error = new HttpError("Something went wrong, can't fetch followers", 500);
        return next(error);
    }
    if (!userWithFollowers) {
        return next(new HttpError("No user find for this id", 404));
    }

    await res.json({
        followers: userWithFollowers.followers.map(
            follower => follower.toObject({getter: true})
        )
    });
};

const getFollowing = async (req, res, next) => {

    let userWithFollowing;
    const userId = req.params.uid;
    try {
        userWithFollowing = await User.findById(userId).populate('following');
    } catch (err) {
        const error = new HttpError("Something went wrong, can't fetch following", 500);
        return next(error);
    }
    if (!userWithFollowing) {
        return next(new HttpError("No user find for this id", 404));
    }

    await res.json({
        following: userWithFollowing.following.map(
            following => following.toObject({getter: true})
        )
    });
};

const follow = async (req, res, next) => {
    const userId = req.params.uid;
    const loggedInUserId = req.userData.userId;
    let loggedInUser;
    try {
        loggedInUser = await User.findById(loggedInUserId);
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }
    if (loggedInUserId !== userId) {
        let userToFollow;
        try {
            userToFollow = await User.findById(userId).populate('following');
        } catch (err) {
            const error = new HttpError("Something went wrong, can't fetch following", 500);
            return next(error);
        }
        if (!userToFollow.followers.includes(loggedInUserId)) {
            try {
                const sess = await mongoose.startSession();
                sess.startTransaction();
                userToFollow.followers.push(loggedInUserId);
                loggedInUser.following.push(userId);
                await userToFollow.save();
                await loggedInUser.save();
                await sess.commitTransaction();
            } catch (err) {
                return next(new HttpError(err.message, 500));
            }
            res.status(201).json(
                {message: "User followed"});
        } else {
            await res.json(
                {message: "Can't follow again"}
            );
        }

    } else {
        res.status(500).json({
            message: "Can't follow yourself"
        });
    }

};

const unFollow = async (req, res, next) => {
    const userId = req.params.uid;
    const loggedInUserId = req.userData.userId;
    const loggedInUser = await User.findById(loggedInUserId);

    let userToUnFollow;
    try {
        userToUnFollow = await User.findById(userId).populate('following');
    } catch (err) {
        const error = new HttpError("Something went wrong, can't fetch following", 500);
        return next(error);
    }

    if (userToUnFollow.followers.includes(loggedInUserId)) {
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            userToUnFollow.followers.pull(loggedInUserId);
            loggedInUser.following.pull(userId);
            await userToUnFollow.save();
            await loggedInUser.save();
            await sess.commitTransaction();
        } catch (err) {
            return next(new HttpError("Unfollowing user failed", 500));
        }
        res.status(201).json(
            {message: "User Unfollowed"});
    } else {
        await res.json({message: "Can't unfollow if not followed"});
    }

};
exports.follow = follow;
exports.unFollow = unFollow;
exports.getFollowers = getFollowers;
exports.getFollowing = getFollowing;