const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const env = require("dotenv");
const storiesRoutes = require('./routes/stories-routes');
const followRoutes = require('./routes/follow-routes');
const usersRoutes = require('./routes/users-routes');
const bannersRoutes = require('./routes/banners-routes');
const categoryRoutes = require('./routes/category-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

    next();
});

app.use('/api/stories', storiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/category', categoryRoutes);

app.use((req, res, next) => {
    throw new HttpError('Could not find this route.', 404);
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 5000);
    res.json({message: error.message || 'An unknown error occurred!'});
});


env.config();
mongoose
    .connect(
        //mongodb+srv://chksai:<password>@cluster0.rtjil.mongodb.net/<dbname>?retryWrites=true&w=majority
        `mongodb+srv://chksai:Kumar$1997@cluster0.rtjil.mongodb.net/insta?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true

        }

    )
     .then(() => {
        console.log("Database connected");
      });
    

   
    app.listen(process.env.PORT || 2020, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
      });
