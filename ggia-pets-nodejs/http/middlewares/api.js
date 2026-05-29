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

		console.log("HEADERS =>", req.headers);

		const authHeader = req.header("authorization");

		console.log("AUTH HEADER =>", authHeader);

		if (!authHeader) {
			throw new Error("No authorization header");
		}

		const token = authHeader.split(' ')[1];

		console.log("TOKEN =>", token);

		const user = await UserModel.findByToken(token);

		console.log("USER =>", user);

		if (!user) {
			throw new Error("Unauthorized");
		}

		req.user = user;

		next();

	} catch (e) {

		console.log(e, 'IN API auth middleware');

		return response.middlewareError("Unauthorized");
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