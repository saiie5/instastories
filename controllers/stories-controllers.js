const {validationResult} = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Story = require('../models/story');
const User = require('../models/user');

//get all stories
const getAllStories = async (req, res, next) => {
    let stories;
    try {
        stories = await Story.find();
    } catch (err) {
        const error = new HttpError(
            'Fetching stories failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!stories || stories.length === 0) {
        return next(
            new HttpError('Could not find any stories at the moment.', 404)
        );
    }
    await res.json({
        stories: stories.map(story =>
            story.toObject({getters: true})
        )
    });
};
//grt story by id 
const getStoryById = async (req, res, next) => {
    const storyId = req.params.sid;

    let story;
    try {
        story = await Story.findById(storyId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a story.',
            500
        );
        return next(error);
    }

    if (!story) {
        const error = new HttpError(
            'Could not find story for the provided id.',
            404
        );
        return next(error);
    }

    await res.json({story: story.toObject({getters: true})});
};
//get storey by user id
const getStoriesByUserId = async (req, res, next) => {
    const userId = req.params.uid;


    let userWithStories;
    try {
        userWithStories = await User.findById(userId).populate('stories');
    } catch (err) {
        const error = new HttpError(
            'Fetching stories failed, please try again later.',
            500
        );
        return next(error);
    }

    
    if (!userWithStories) {
        return next(
            new HttpError('Could not find provided user id.', 404)
        );
    }

    await res.json({
        stories: userWithStories.stories.map(story =>
            story.toObject({getters: true})
        )
    });
};
//create storey
const createStory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    const loggedInUserId = req.userData.userId;
    const {title, intro, description, isAnonymous} = req.body;
    const date = Date().toLocaleString();
    let filePath;

    if (req.file) {
        filePath = req.file.path;
    } else {
        filePath = 'uploads/images/DStory.jpeg'
    }
    const createdStory = new Story({
        title,
        description,
        isAnonymous,
        intro,
        image: 'http://localhost:5000/' + filePath,
        creator: loggedInUserId,
        createdOn: date,
        likedBy: []
    });

    let user;
    try {
        user = await User.findById(loggedInUserId);
    } catch (err) {
        const error = new HttpError(
            err.message + "okdlks",
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id.', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdStory.save();
        user.stories.push(createdStory);
        await user.save();
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            err.message + "lol",
            500
        );
        return next(error);
    }

    res.status(201).json({story: createdStory});
};
//update storey
const updateStory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const {title, intro, description} = req.body;
    const storyId = req.params.sid;

    let story;
    try {
        story = await Story.findById(storyId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update story.',
            500
        );
        return next(error);
    }

    story.title = title;
    story.intro = intro;
    story.description = description;

    try {
        await story.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update story.',
            500
        );
        return next(error);
    }

    res.status(200).json({
        story: story.toObject(
            {getters: true})
    });
};
//delet storey
const deleteStory = async (req, res, next) => {
    const StoryId = req.params.sid;
    const loggedInUserId = req.userData.userId;
    let story;
    try {
        story = await Story.findById(StoryId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            err.message,
            500
        );
        return next(error);
    }

    if (!story) {
        const error = new HttpError('Could not find story for this id.', 404);
        return next(error);
    }
    if (story.creator.id === loggedInUserId) {
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await story.remove();
            story.creator.stories.pull(story);
            await story.creator.save();
            await sess.commitTransaction();
        } catch (err) {
            const error = new HttpError(
                err.message,
                500
            );
            return next(error);
        }

        res.status(200).json({message: 'Deleted story.'});
    } else {
        await res.json({message: "Not your story to delete"});
    }

};
//like storey
const likeStory = async (req, res, next) => {
    const storyId = req.params.sid;
    const loggedInUserId = req.userData.userId;
    let story;
    try {
        story = await Story.findById(storyId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not like story.',
            500
        );
        return next(error);
    }
    if (story.likedBy.length === 0 || !story.likedBy.includes(loggedInUserId)) {
        try {
            story.likedBy.push(loggedInUserId);
            await story.save();
        } catch (err) {
            const error = new HttpError(
                err.message,
                500
            );
            return next(error);
        }

        res.status(200).json({
            story: story.toObject(
                {getters: true})
        });
    } else {
        await res.json(
            {message: "can't like again!!!"}
        );
    }
};
//unlike storey

const unLikeStory = async (req, res, next) => {
    const storyId = req.params.sid;
    const loggedInUserId = req.userData.userId;
    let story;
    try {
        story = await Story.findById(storyId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not unlike story.',
            500
        );
        return next(error);
    }
    if (story.likedBy.includes(loggedInUserId)) {
        try {
            story.likedBy.pull(loggedInUserId);
            await story.save();
        } catch (err) {
            const error = new HttpError(
                err.message,
                500
            );
            return next(error);
        }
        res.status(200).json({
            story: story.toObject(
                {getters: true})
        });
    } else {
        await res.json({message: "Can't unlike if not liked"});
    }
};

//Find story by title, here $project tells which fields to return!!
// db.stories.aggregate([{$search:{"text":{"query":"mongo","path":"title"}}},{$project:{"title":1}}])
//to return all fields use
//db.stories.aggregate([{$search:{"text":{"query":"mongo","path":"title"}}}])

const searchStories = async (req, res, next) => {
    const query = req.params.query;
    let results;
    try {
        let agg = Story.aggregate([{
            $search: {
                "text": {
                    "query": query, "path": ["title", "intro", "description"], "fuzzy": {
                        "maxEdits": 2,
                        "maxExpansions": 20,
                    }
                }
            }
        }, {
            $project: {
                "title": 1,
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


exports.getStoryById = getStoryById;
exports.getStoriesByUserId = getStoriesByUserId;
exports.createStory = createStory;
exports.updateStory = updateStory;
exports.deleteStory = deleteStory;
exports.getAllStories = getAllStories;
exports.likeStory = likeStory;
exports.unLikeStory = unLikeStory;
exports.searchStories = searchStories;


