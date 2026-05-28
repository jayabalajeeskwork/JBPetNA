require('dotenv');
/* Helpers */
const Helper = require("../../helpers/helpers");
const {  } = require("../../helpers/constants");
/* End Helpers*/

/* Models */
const UserModel = require('../../models/user.model');
/* End Models*/

/* Responses */
const ValidationResponse = require('../responses/validation.response');
/* End Response */

class ApiMiddleware {

	async auth(req, res, next) {
		const response = new ValidationResponse(req, res);
		try {
			const token = req.header("authorization").split(' ')[1];
			const user = await UserModel.findByToken(token);
			if (!user) {
				throw new Error("unauthorized");
			}
			// else if (user.status === profileStatus.INACTIVE) {
			// 	throw new Error("Profile deactivated");
			// }
			// else if (!user.isOtpVerified) {
			// 	throw new Error("User not verified")
			// }
			req.user = user;
			next();
		} catch (e) {
			console.log(e, 'IN API auth middleware')
			return response.middlewareError("Unauthorized")
		}
	}

	async optionalAuth(req, res, next) {
		try {
			if (req.header("authorization")) {
				const authHeader = req.header("authorization");
				const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader;
				const user = await UserModel.findByToken(token);
				if (user && user.isOtpVerified) {
					req.user = user;
				}
			}
			next();
		} catch (e) {
			console.log(e, 'IN API optionalAuth middleware');
			next();
		}
	}
}

module.exports = new ApiMiddleware();