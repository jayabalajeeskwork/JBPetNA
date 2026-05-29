const express = require("express");
const Route = express.Router();

/* Controllers */
const UserAuthController =
require("../http/controllers/api/auth.controller");

/* Requests */
const AuthRequest =
require("../http/requests/api/auth.request");

/* AUTH ROUTES */

Route.post(
   "/send-verification-email",
   UserAuthController.sendVerificationEmail
);

Route.post(
   "/verify-otp",
   UserAuthController.verifyOtp
);

Route.post(
   "/set-password",
   UserAuthController.setPassword
);

Route.post(
   "/login",
   AuthRequest.login(),
   UserAuthController.login
);

Route.post(
   "/send-reset-otp",
   UserAuthController.sendResetPasswordOtp
);

Route.post(
   "/verify-reset-otp",
   UserAuthController.verifyResetOtp
);

Route.post(
   "/reset-password",
   UserAuthController.resetPassword
);

module.exports = Route;

