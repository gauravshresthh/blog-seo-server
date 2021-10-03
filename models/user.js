const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        trim: true,
        unique: [true, 'Email already taken'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
        index: true,
    },
    photo: {
        type: String,
    },
    otp: {
        type: Number,
        select: false,
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be minimun of 8 lengths'],
        select: false,
    },
    // passwordConfirm: {
    //   type: String,
    //   validate: {
    //     // This only works on CREATE and SAVE!!!
    //     validator: function (el) {
    //       return el === this.password;
    //     },
    //     message: 'Passwords are not the same!',
    //   },
    // },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    is_verified: {
        type: Boolean,
        default: false,
    },
    phone: {
        type: Number,
    },
    province: {
        type: String,
    },
    district: {
        type: String,
    },
    city: {
        type: String,
    },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// userSchema.pre(/^find/, function(next) {
//     // this points to the current query
//     this.find({ active: { $ne: false } });
//     next();
// });

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.methods.setUserVerified = function() {
    this.is_verified = true;
};

const User = mongoose.model('User', userSchema);

module.exports = User;