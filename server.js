const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const blogRouter = require('./routes/blog');
const authRouter = require('./routes/auth');
const globalErrorHandler = require('./utils/globalErrorHandler');
const AppError = require('./utils/appError');

const DBConnect = require('./db');

require('dotenv').config();

const app = express();

app.use(express.json());

DBConnect();

if ((process.env.NODE_ENV = 'development')) {
    app.use(morgan('dev'));
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

app.use(cookieParser());

const PORT = process.env.PORT;

app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/auth', authRouter);
app.all('*', (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});