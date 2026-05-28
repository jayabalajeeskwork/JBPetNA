const bodyValidator = require("express-validator").body;
const queryValidator = require("express-validator").query;
const paramValidator = require("express-validator").param;
const { default: axios } = require("axios");
const url = require('url');

const BaseRequest = require("../_base.request");

const { query } = require("express-validator");
const { validatePhoneNumber } = require("../../../helpers/helpers");

class AuthRequest extends BaseRequest {
    constructor() {
        super();
    }

    signup() {
        return [
            bodyValidator("phone").exists().notEmpty().withMessage("Phone is required")
                .custom(value => {
                    if (!validatePhoneNumber(value)) {
                        throw new Error("Phone number is invalid");
                    }
                    return true;
                }),
            bodyValidator("phoneCode").exists().notEmpty().withMessage("Phone code is required"),
            
            // Conditional validation for Stage 2 (Business Details & Email)
            // We assume Stage 2 if businessName is provided
            bodyValidator("businessName").optional().notEmpty().withMessage("Business name is required"),
            bodyValidator("email").if(bodyValidator("businessName").exists())
                .exists().isEmail().withMessage("Valid email is required"),
            bodyValidator("password").if(bodyValidator("businessName").exists())
                .exists().notEmpty().withMessage("Password is required"),
            bodyValidator("businessType").if(bodyValidator("businessName").exists())
                .exists().notEmpty().withMessage("Business type is required"),
            bodyValidator("contactPerson").if(bodyValidator("businessName").exists())
                .exists().notEmpty().withMessage("Contact person is required"),
            
            this.validate
        ]
    }

    login() {
        return [
            bodyValidator("email").optional().isEmail().withMessage("Valid email is required"),
            bodyValidator("phone").optional().notEmpty().withMessage("Phone is required"),
            bodyValidator("password").optional().notEmpty().withMessage("Password is required"),
            this.validate
        ];
    }

    verifyOtp() {
        return [
            bodyValidator("otp").exists().notEmpty().withMessage("OTP is required"),
            bodyValidator("email").optional().isEmail().withMessage("Valid email is required"),
            bodyValidator("phone").optional().notEmpty().withMessage("Phone is required"),
            this.validate
        ];
    }

    resendOtp() {
        return [
            bodyValidator("email").optional().isEmail().withMessage("Valid email is required"),
            bodyValidator("phone").optional().notEmpty().withMessage("Phone is required"),
            this.validate
        ];
    }

    logout() {
        return [
            this.validate
        ];
    }
}

module.exports = new AuthRequest();