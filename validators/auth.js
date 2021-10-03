const { check } = require('express-validator');

exports.userSignupValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').exists().isEmail().withMessage('Email should be valid'),
    check('password')
    .exists()
    .isLength({ min: 6 })
    .withMessage('Password should be more than 6 characters long'),
    check('password_confirm', 'Passwords do not match')
    .exists()
    .custom((value, { req }) => value === req.body.password),
];