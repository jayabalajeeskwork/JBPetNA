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

        const { email, password } = req.body;

        const user =
            await this._userRepository.findOne({ email });

        if (!user) {
            throw new BadRequestError('Invalid credentials');
        }

        if (!user.isActive) {
            throw new BadRequestError('User disabled');
        }

        const isMatch =
            await user.comparePassword(password);

        if (!isMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        const token = await user.generateToken();

        return response.okResponse({
            user,
            token
        });

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

        const { email, otp } = req.body;

        const user =
            await this._userRepository.findOne({ email });

        if (!user) {
            throw new BadRequestError('User not found');
        }

        if (
            user.otp !== otp ||
            user.otpExpires < Date.now()
        ) {
            throw new BadRequestError('Invalid OTP');
        }

        user.isOtpVerified = true;
        user.isEmailVerified = true;
        user.otp = null;
        user.otpExpires = null;

        await user.save();

        return response.okResponse({
            message: 'OTP verified'
        });

    } catch (e) {

        if (e instanceof BadRequestError) {
            return response.badRequestResponse(e);
        }

        return response.internalServerErrorResponse(e);
    }
}
disableCityAdmin = async (req, res) => {

    try {

        const { userId } = req.body;

        const user =
            await this._userRepository.findById(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'City admin disabled'
        });

    } catch (e) {

        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}
sendResetPasswordOtp = async (req, res) => {

    try {

        const { email } = req.body;

        const user =
            await this._userRepository.findOne({
                email
            });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const otp =
            helpers.generateOTP().toString();

        user.otp = otp;

        user.otpExpires =
            Date.now() + 10 * 60 * 1000;

        await user.save();

        await helpers.sendEmailOTP(
            email,
            otp
        );

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });

    } catch (e) {

        return res.status(500).json({
            success: false,
            message: e.message
        });
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
sendResetPasswordOtp = async (req, res) => {

    try {

        const { email } = req.body;

        const user =
            await this._userRepository.findOne({
                email
            });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const otp =
            helpers.generateOTP().toString();

        user.otp = otp;

        user.otpExpires =
            Date.now() + 10 * 60 * 1000;

        await user.save();

        await helpers.sendEmailOTP(
            email,
            otp
        );

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });

    } catch (e) {

        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}
verifyResetOtp = async (req, res) => {

    try {

        const { email, otp } = req.body;

        const user =
            await this._userRepository.findOne({
                email
            });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (
            user.otp !== otp ||
            user.otpExpires < Date.now()
        ) {

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        user.isOtpVerified = true;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'OTP verified'
        });

    } catch (e) {

        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}
resetPassword = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user =
            await this._userRepository.findOne({
                email
            });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isOtpVerified) {

            return res.status(400).json({
                success: false,
                message: 'OTP not verified'
            });
        }

        user.password = password;

        user.isOtpVerified = false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (e) {

        return res.status(500).json({
            success: false,
            message: e.message
        });
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

    sendVerificationEmail = async (req, res) => {

    const response = new AuthResponse(req, res);

    try {

        const { email, role } = req.body;

        const existingUser =
            await this._userRepository.findOne({ email });

        if (existingUser) {
            throw new BadRequestError('User already exists');
        }

        const otp = helpers.generateOTP().toString();

        const user =
            await this._userRepository.create({
                email,
                role,
                otp,
                otpExpires: Date.now() + 10 * 60 * 1000
            });

        await helpers.sendEmailOTP(email, otp);

        return response.okResponse({
            message: 'Verification email sent'
        });

    } catch (e) {

        if (e instanceof BadRequestError) {
            return response.badRequestResponse(e);
        }

        return response.internalServerErrorResponse(e);
    }
}
setPassword = async (req, res) => {

    const response = new AuthResponse(req, res);

    try {

        const { email, password } = req.body;

        const user =
            await this._userRepository.findOne({ email });

        if (!user) {
            throw new BadRequestError('User not found');
        }

        if (!user.isOtpVerified) {
            throw new BadRequestError('Verify OTP first');
        }

        user.password = password;

        await user.save();

        return response.okResponse({
            message: 'Password set successfully'
        });

    } catch (e) {

        if (e instanceof BadRequestError) {
            return response.badRequestResponse(e);
        }

        return response.internalServerErrorResponse(e);
    }
}
}

module.exports = new AuthController();
