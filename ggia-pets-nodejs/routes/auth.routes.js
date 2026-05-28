const express = require("express");
const Route = express.Router();

/* Controllers*/
const UserAuthController = require("../http/controllers/api/auth.controller");
/* End Controllers*/

/* Requests */
const AuthRequest = require("../http/requests/api/auth.request");
/* End Requests */

/* Routes*/

/**Auth Routes */
Route.post("/signup", AuthRequest.signup(), UserAuthController.signup);
Route.post("/login", AuthRequest.login(), UserAuthController.login);
Route.post("/verify-otp", AuthRequest.verifyOtp(), UserAuthController.verifyOtp);
Route.post("/resend-otp", AuthRequest.resendOtp(), UserAuthController.resendOtp);
Route.post("/logout", AuthRequest.logout(), UserAuthController.logout);
Route.post("/update-profile", UserAuthController.updateProfile);

module.exports = Route;
