const catchAsync = require('../utils/catchAsync');
const Joi = require('joi');
const AppError = require('../utils/appError');
const User = require('../models/user');
const { createSendToken } = require('../helpers/tokenHelper');

exports.signup = catchAsync(async(req, res, next) => {
    const schema = Joi.object({
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .min(8)
            .required(),
        email: Joi.string()
            .email({
                minDomainSegments: 2,
                tlds: { allow: ['com', 'net'] },
            })
            .required(),
        name: Joi.string().required(),
    });

    const { error } = schema.validate({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });

    if (error) {
        return next(new AppError(`${error.details[0].message}`, 400));
    }
    const { email } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(409).json({
            success: false,
            message: 'This email address is already associated with another account.',
        });
    }

    let user = new User(req.body);

    user = await user.save();
    createSendToken(user, 200, req, res);
});

exports.login = catchAsync(async(req, res, next) => {
    const schema = Joi.object({
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        email: Joi.string().email({
            minDomainSegments: 2,
            tlds: { allow: ['com', 'net'] },
        }),
    });

    const { error } = schema.validate({
        email: req.body.email,
        password: req.body.password,
    });

    if (error) {
        return next(new AppError(`${error.details[0].message}`, 403));
    }

    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Invalid email or password', 401));
    }

    if (user.role === 'admin') {
        return next(new AppError('Not for admin login', 403));
    }
    // if (!user.isVerified) {
    //   return res.status(401).send({
    //     status: 'fail',
    //     message: 'Your Email has not been verified. Please click on resend',
    //   });
    // }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, req, res);
});