import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
  updateAccountDetails,
  getCurrentUser
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured routes; only logged in users can access
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-password").post(verifyJWT, updatePassword);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
