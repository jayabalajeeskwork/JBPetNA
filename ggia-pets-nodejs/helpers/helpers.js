const env = require('dotenv').config().parsed;
const logger = require('../config/logger');
const bcrypt = require('bcrypt');
const path = require('path');
const axios = require('axios')

const fs = require('fs');
const { promisify } = require('util');
const fsAccess = promisify(fs.access);
const fsUnlink = promisify(fs.unlink);
const QRCode = require('qrcode')
const { customAlphabet } = require('nanoid');
const FormData = require('form-data');


class Helpers {

    constructor() {
        this.generateOTP = this.generateOTP.bind(this);
        this.sendResetPasswordLink = this.sendResetPasswordLink.bind(this);
    }

    generateRandomString(str = '1234567890abcdef', len = 10) {
        const nanoid = customAlphabet(str, len)
        return nanoid()
    }

    generateAcknowledgmentId() {
        const year = new Date().getFullYear();
        const random = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
        return `ACK-${year}-${random}`;
    }

    getErrorMessage([req, res], error = null) {
        console.log(error, "Error in getErrorMessage");
        // logger.error(error)
        return res.status(422).json({
            "status": "fail",
            "response": error ? error.message : 'something_went_wrong'
        });
    }

    getSuccessMessage([req, res], data = null, customObj = null) {
        let response = {
            "status": "success",
            "response": data ? data : 'request_process_successfully'
        }
        if (customObj) {
            response = { ...response, ...customObj }
        }
        return res.status(200).json(response);
    }
    getValidationErrorMessage([req, res], data = null, customObj = null) {
        //console.log(data);
        //logger.error(data)
        let response = {
            "status": "fail",
            "response": data ? data : ('invalid_parameters')
        }
        if (customObj) {
            response = { ...response, ...customObj };
        }
        return res.status(422).json(response);
    }

    generateOTP(min = 100000, max = 999999) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async _sendViaResendApi(payload) {
        try {
            const response = await axios.post(
                'https://api.resend.com/emails',
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("Resend API Success:", response.data);
            return response.data;
        } catch (error) {
            console.error("Resend API Error:", error.response ? error.response.data : error.message);
            throw new Error("RESEND_API_ERROR: " + (error.response ? JSON.stringify(error.response.data) : error.message));
        }
    }

    async sendEmail({ to, subject, html, text, from }) {
        const payload = {
            from: from || 'bl-support@mail.licenseportal.us',
            to: Array.isArray(to) ? to : [to],
            subject,
            html: html || text,
            text: text || html
        };

        return await this._sendViaResendApi(payload);
    }

    async sendEmailOTP(email, otp) {
        try {
            await this.sendEmail({
                to: email,
                subject: 'Your Verification Code',
                html: `<p>Your verification code is: <strong>${otp}</strong></p><p>Passcode expires in 10 minutes.</p>`,
                text: `Your verification code is: ${otp}. Passcode expires in 10 minutes.`
            });
            return true;
        } catch (error) {
            console.error("Error sending email OTP:", error);
            return false;
        }
    }

    async sendSMSOTP(phone, otp) {
        try {
            // Using Flow API for OTP (variable name: var)
            const variables = {
                var: otp
            };
            await this.sendSMSViaFlow(phone, process.env.MSG91_FLOW_ID, variables);
            return true;
        } catch (error) {
            console.error("Error sending SMS OTP via Flow:", error);
            return false;
        }
    }



    async sendAcknowledgmentEmail(email, link) {
        try {
            await this.sendEmail({
                to: email,
                subject: 'Acknowledgment Form Link',
                html: `<p>Please click the link below to fill out the acknowledgment form:</p><p><a href="${link}">${link}</a></p>`,
                text: `Please use the following link to fill out the acknowledgment form: ${link}`
            });
            return true;
        } catch (error) {
            console.error("Error sending acknowledgment email:", error);
            return false;
        }
    }

    async sendSMS(phone, text) {
        try {
            const payload = {
                sender: process.env.MSG91_SENDER_ID || 'SAVORY',
                route: process.env.MSG91_ROUTE || '4',
                country: '0',
                sms: [
                    {
                        message: text,
                        to: [ phone ]
                    }
                ]
            };

            const response = await axios.post(
                'https://api.msg91.com/api/v2/sendsms',
                payload,
                {
                    headers: {
                        'authkey': process.env.MSG91_AUTH_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("MSG91 API Success:", response.data);
            return response.data;
        } catch (error) {
            console.error("MSG91 API Error:", error.response ? error.response.data : error.message);
            throw new Error("MSG91_API_ERROR: " + (error.response ? JSON.stringify(error.response.data) : error.message));
        }
    }

    async sendAcknowledgmentSMS(phone, link) {
        try {
            // Using Flow API for Acknowledgment Link (variable name: link)
            const variables = {
                link: link
            };
            await this.sendSMSViaFlow(phone, process.env.MSG91_ACK_FLOW_ID, variables);
            return true;
        } catch (error) {
            console.error("Error sending acknowledgment sms via Flow:", error);
            return false;
        }
    }


    async sendSMSViaFlow(phone, flowId, variables) {
        try {
            // Remove + from phone number if present for MSG91
            const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;

            const payload = {
                flow_id: flowId || process.env.MSG91_FLOW_ID,
                sender: process.env.MSG91_SENDER_ID || 'SAVORY',
                recipients: [
                    {
                        mobiles: formattedPhone,
                        ...variables
                    }
                ]
            };

            const response = await axios.post(
                'https://control.msg91.com/api/v5/flow/',
                payload,
                {
                    headers: {
                        'authkey': process.env.MSG91_AUTH_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("MSG91 Flow API Success:", response.data);
            return response.data;
        } catch (error) {
            console.error("MSG91 Flow API Error:", error.response ? error.response.data : error.message);
            throw new Error("MSG91_FLOW_API_ERROR: " + (error.response ? JSON.stringify(error.response.data) : error.message));
        }
    }



    async extractVaccineDataFromUnstract(s3Url) {
        try {
            // Unstract Execution API expects 'presigned_urls' as an array of strings.
            // Using JSON payload as it's often more reliable for metadata-only requests.
            const payload = {
                presigned_urls: Array.isArray(s3Url) ? s3Url : [s3Url]
            };

            const response = await axios.post(
                process.env.UNSTRACT_API_ENDPOINT,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.UNSTRACT_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("Unstract API Success:", response.data);
            return response.data;
        } catch (error) {
            console.error("Unstract API Error:", error.response ? error.response.data : error.message);
            throw new Error("UNSTRACT_API_ERROR: " + (error.response ? JSON.stringify(error.response.data) : error.message));
        }
    }

    sendOTP(otp) {
        return true;
    }

    sendResetPasswordLink() {
        const otp = this.generateOTP();
        //
        return otp;
    }

    getAuthErrorMessage([req, res], data = null) {
        return res.status(401).json({
            "status": "fail",
            "response": data
        });
    }

    AdminUrl(value) {
        return env.ADMIN_URL + value;
    }

    AuthUrl(value) {
        return env.APP_URL + '/auth' + value;
    }

    hashString(string) {
        let saltRounds = 10;
        return bcrypt.hashSync(string, saltRounds);
    }

    compareHashedString(newString, originalString) {
        return bcrypt.compareSync(newString, originalString)
    }


    getFilename(files, name) {
        return files[name] ? files[name][0]['filename'] : null;
    }


    async removeFile(filename) {
        try {
            const filePath = this.getUploadPath(filename);
            await fsAccess(filePath, fs.constants.F_OK);
            await fsUnlink(filePath);
        } catch (e) {
            console.log(e);
        }
    }

    getUploadPath(filename) {
        return path.join(__dirname, '../', 'public', 'uploads/') + (filename || '');
    }


    async qrCodeGeneratorToBase64(data) {
        const opt = {
            margin: 1,
            scale: 10
        }
        return QRCode.toDataURL(JSON.stringify(data), opt)
    }

    validatePhoneNumber(phone) {
        if (!phone) return false;
        // Basic validation: Allow optional '+' at start, then only digits. Length 7-15.
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, '')); // Remove spaces and test
    }

    calculateVat(amount) {
        let vat = 10;
        return parseFloat(((amount * vat) / 100).toFixed(2));
    }

    /**
     * Generate pagination parameters from request query
     * @param {Object} query - Request query object
     * @param {number} defaultLimit - Default limit per page (default: 20)
     * @param {number} maxLimit - Maximum limit per page (default: 100)
     * @returns {Object} Pagination parameters
     */
    getPaginationParams(query, defaultLimit = 20, maxLimit = 100) {
        const page = Math.max(1, parseInt(query.page) || 1);
        const limit = Math.min(Math.max(1, parseInt(query.limit) || defaultLimit), maxLimit);
        const skip = (page - 1) * limit;

        return {
            page,
            limit,
            skip
        };
    }

    /**
     * Create paginated response object following project standards
     * @param {Array} data - Array of results
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     * @param {number} total - Total number of items
     * @returns {Object} Paginated response object
     */
    createPaginatedResponse(data, page, limit, total) {
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            }
        };
    }
}

module.exports = new Helpers();