const AppError = require('./appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;

    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate field value entered: ${value}. Please try using some other value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid data inserted. ${errors.join('. ')}`;

    // const message = Object.values(err.errors).map((el) => el.message);

    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);

const handleMulterError = () => {
    return new AppError('Please enter valid email with field name as photo', 401);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: err.success,
        // error: err,
        message: err.message,
        // stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
        });

        // Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error
        console.error('ERROR', err);

        // 2) Send generic message
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
        });
    }
};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.success = err.success || false;

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = err;

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);

        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        if (error.name === 'MulterError') error = handleMulterError();

        sendErrorProd(error, res);
    }
};