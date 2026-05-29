const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;
const { roles } = require('../helpers/constants');

const UserSchema = new Schema({

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        default: null
    },

    role: {
        type: Number,
        enum: Object.values(roles),
        required: true
    },

    otp: {
        type: String,
        default: null
    },

    otpExpires: {
        type: Date,
        default: null
    },

    isOtpVerified: {
        type: Boolean,
        default: false
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    tokens: [{
        access: String,
        token: String
    }]

}, {
    timestamps: true
});

UserSchema.pre('save', async function(next) {

    const user = this;

    if (user.isModified('password')) {

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            user.password,
            salt
        );
    }

    next();
});

UserSchema.methods.comparePassword = async function(password) {

    return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateToken = async function() {

    const token = jwt.sign(
        {
            _id: this._id,
            role: this.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '365d'
        }
    );

    this.tokens = [{
        access: 'auth',
        token
    }];

    await this.save();

    return token;
};

UserSchema.statics.findByToken = async function(token) {

    try {

        console.log("TOKEN RECEIVED =>", token);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED =>", decoded);

        const user = await this.findById(decoded._id);

        console.log("FOUND USER =>", user);

        return user;

    } catch (e) {

        console.log("findByToken ERROR =>", e);

        return null;
    }
};

module.exports = mongoose.model(
    'User',
    UserSchema
);