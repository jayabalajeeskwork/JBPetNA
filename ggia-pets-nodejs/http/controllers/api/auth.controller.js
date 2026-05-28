const jwt = require('jsonwebtoken');
const BaseController = require('../_base.controller');
const AuthResponse = require('../../responses/api/auth.response');
const BadRequestError = require('../../../exceptions/badRequest.exception');
const helpers = require('../../../helpers/helpers');

class AuthController extends BaseController {

    constructor() {
        super();
    }
    /**
     * Login logic will be implemented here
     */
    signup = async (req, res) => {
        const response = new AuthResponse(req, res);
        try {
            const {
                type,
                businessName,
                businessAddress,
                municipality,
                contactPerson,
                sameAsBusinessOwner,
                email,
                phoneCode,
                phone,
                businessType,
                password
            } = req.body;

            // Stage 1: Initial Phone Registration
            if (!businessName) {
                // Check if user already exists and is fully verified
                const existingUser = await this._userRepository.findOne({ phone, phoneCode });

                let user;
                if (existingUser) {
                    if (existingUser.isPhoneVerified && existingUser.isEmailVerified) {
                        throw new BadRequestError('User already exists');
                    }
                    user = existingUser;
                } else {
                    user = await this._userRepository.create({
                        phone,
                        phoneCode
                    });
                }

                // Generate and send Phone OTP
                const otp = helpers.generateOTP().toString();
                const otpExpires = Date.now() + 10 * 60 * 1000;
                user.otp = otp;
                user.otpExpires = otpExpires;
                await user.save();

                await helpers.sendSMSOTP((user.phoneCode || '') + user.phone, otp);

                return response.okResponse({ message: 'OTP sent to phone', otp });
            }

            // Stage 2: Business Details & Email Registration
            const user = await this._userRepository.findOne({ phone, phoneCode });
            if (!user) {
                throw new BadRequestError('Please verify your phone number first');
            }

            if (!user.isPhoneVerified) {
                throw new BadRequestError('Phone number not verified');
            }

            // Check if email is already taken by another user
            if (email) {
                const existingEmail = await this._userRepository.findOne({ email, _id: { $ne: user._id } });
                if (existingEmail) {
                    throw new BadRequestError('Email already exists');
                }
            }

            // Update user with business details
            user.businessType = businessType || type;
            user.businessName = businessName;
            user.businessAddress = businessAddress;
            user.municipality = municipality;
            user.contactPerson = contactPerson;
            user.sameAsBusinessOwner = sameAsBusinessOwner;
            user.email = email;
            user.password = password; // pre-save hook will hash it

            // Generate and send Email OTP
            const otp = helpers.generateOTP().toString();
            const otpExpires = Date.now() + 10 * 60 * 1000;
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();

            await helpers.sendEmailOTP(user.email, otp);

            return response.okResponse({ message: 'OTP sent to email', otp });
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e);
            }
            return response.internalServerErrorResponse(e);
        }
    }

    login = async (req, res) => {
        const response = new AuthResponse(req, res);
        try {
            const { email, phone, phoneCode, password } = req.body;
            let query = {};
            if (email) {
                query = { email };
            } else if (phone && phoneCode) {
                query = { phone, phoneCode };
            } else if (phone) {
                query = { phone };
            } else {
                throw new BadRequestError('Email or phone is required');
            }

            const user = await this._userRepository.findOne(query);

            if (!user) {
                throw new BadRequestError('Invalid identifier or password');
            }

            // If password is provided, use password login
            if (password) {
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    throw new BadRequestError('Invalid identifier or password');
                }

                // Ensure user is verified
                if (!user.isEmailVerified || !user.isPhoneVerified) {
                    // If not verified, we might want to trigger OTP flow or return specific error
                    // For now, allow login if they have a password, but standard practice might differ
                }

                const token = await user.generateToken();
                return response.okResponse({ user, token });
            } else {
                // If password is NOT provided, send OTP
                const otp = helpers.generateOTP().toString();
                const otpExpires = Date.now() + 10 * 60 * 1000;

                user.otp = otp;
                user.otpExpires = otpExpires;
                user.isOtpVerified = false;
                await user.save();

                if (user.email) {
                    await helpers.sendEmailOTP(user.email, otp);
                }

                if (user.phone) {
                    const fullPhone = (user.phoneCode || '') + user.phone;
                    await helpers.sendSMSOTP(fullPhone, otp);
                }
                return response.okResponse({ identifier: user.email || user.phone, message: "OTP sent successfully", otp });
            }
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e);
            }
            return response.internalServerErrorResponse(e);
        }
    }

    verifyOtp = async (req, res) => {
        const response = new AuthResponse(req, res);
        try {
            const { email, phone, phoneCode, otp } = req.body;

            let query = {};
            if (email) {
                query = { email };
            } else if (phone && phoneCode) {
                query = { phone, phoneCode };
            } else if (phone) {
                query = { phone };
            } else {
                throw new BadRequestError('Email or phone is required');
            }

            const user = await this._userRepository.findOne(query);

            if (!user) {
                throw new BadRequestError('User not found');
            }

            if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
                throw new BadRequestError('Invalid or expired OTP');
            }

            // Clear OTP
            user.otp = null;
            user.otpExpires = null;
            user.isOtpVerified = true;

            if (email) {
                user.isEmailVerified = true;
            } else if (phone) {
                user.isPhoneVerified = true;
            }

            await user.save();

            // If both verified, return token
            if (user.isEmailVerified && user.isPhoneVerified) {
                const token = await user.generateToken();
                return response.okResponse({ user, token, message: 'Verification successful' });
            }

            return response.okResponse({ user, message: 'Verification successful' });
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e);
            }
            return response.internalServerErrorResponse(e);
        }
    }

    resendOtp = async (req, res) => {
        const response = new AuthResponse(req, res);
        try {
            const { email, phone, phoneCode } = req.body;
            let query = {};
            if (email) {
                query = { email };
            } else if (phone && phoneCode) {
                query = { phone, phoneCode };
            } else if (phone) {
                query = { phone };
            } else {
                throw new BadRequestError('Email or phone is required');
            }

            const user = await this._userRepository.findOne(query);

            if (!user) {
                throw new BadRequestError('User not found');
            }

            // Generate OTP
            const otp = helpers.generateOTP().toString();
            const otpExpires = Date.now() + 10 * 60 * 1000;

            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();

            if (email && user.email) {
                await helpers.sendEmailOTP(user.email, otp);
            } else if (phone && user.phone) {
                const fullPhone = (user.phoneCode || '') + user.phone;
                await helpers.sendSMSOTP(fullPhone, otp);
            }

            return response.okResponse({ message: 'OTP sent successfully', otp });
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e);
            }
            return response.internalServerErrorResponse(e);
        }
    }

    /**
     * Update user profile
     */
    updateProfile = async (req, res) => {
        const response = new AuthResponse(req, res);
        try {
            const { userId, ...updateData } = req.body;

            if (!userId) {
                throw new BadRequestError('User ID is required');
            }

            const user = await this._userRepository.updateById(userId, updateData);

            if (!user) {
                throw new BadRequestError('User not found');
            }

            return response.okResponse({ user, message: 'Profile updated successfully' });
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e);
            }
            return response.internalServerErrorResponse(e);
        }
    }

    /**
     * Logout logic
     */
    logout = async (req, res) => {
        const response = new AuthResponse(req, res);
        try {
            return response.okResponse({ message: 'Logged out' });
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e);
            }
            return response.internalServerErrorResponse(e);
        }
    }
}

module.exports = new AuthController();
