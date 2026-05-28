/* Third Party Libraries */
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
/* Third Party Libraries */

/* Local Files */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { userType: USER_TYPES } = require('../helpers/constants');
/* Local Files */

const UserModel = new Schema({
	businessType: {
		type: Number,
		enum: Object.values(USER_TYPES),
	},
	businessName: {
		type: String,
	},
	businessAddress: {
		type: String,
		default: null
	},
	municipality: {
		type: Schema.Types.ObjectId,
		ref: 'Municipality',
		default: null
	},
	contactPerson: {
		type: String,
	},
	sameAsBusinessOwner: {
		type: Boolean,
		default: false
	},
	email: {
		type: String,
		unique: true,
		sparse: true,
		index: true,
	},
	password: {
		type: String,
		default: null
	},
	phoneCode: {
		type: String,
		default: '+1'
	},
	phone: {
		type: String,
		default: null,
		index: true
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
	isPhoneVerified: {
		type: Boolean,
		default: false
	},
	isEmailVerified: {
		type: Boolean,
		default: false
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
}, {
	timestamps: true
});

UserModel.pre('save', async function (next) {
	const user = this;
	if (user.isModified('password')) {
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);
	}
	next();
});

UserModel.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};
const secret = process.env.JWT_SECRET;

UserModel.methods.generateToken = async function () {
	const auth = this;
	const access = "auth";
	const token = jwt.sign({
		_id: auth._id.toHexString(),
		access,
		exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365), /// 1 Year
	}, secret).toString();

	auth.tokens = [{
		access,
		token
	}];

	await auth.save();
	return token;
};

UserModel.statics.refreshToken = function (user) {
	const access = "auth";
	const token = jwt.sign({
		_id: user._id.toHexString(),
		access,//
		exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365), /// 1 Year
	}, secret).toString();

	user.tokens = [{
		access,
		token
	}];
	return this.findByIdAndUpdate(user._id, user, { new: true });
};

UserModel.statics.findByToken = function (token) {
	const auth = this;
	let decoded;
	try {
		decoded = jwt.verify(token, secret);
	} catch (e) {
		return Promise.reject(e);
	}
	return auth.findOne({
		"_id": decoded._id,
		"tokens.token": token,
	});
};

module.exports = mongoose.model('User', UserModel);
