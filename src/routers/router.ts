import express, { Router } from "express";
export const router: Router = express.Router();

import * as middleware from "../../utils/middleware";
import * as AuthController from "../controllers/authController";
import * as UserController from "../controllers/userController";

// /api/auth
router.post("/auth/user_creation", AuthController.createUser.local); // 회원가입
router.post("/auth/login", AuthController.logIn.local); // 로그인
router.get("/auth/user/profile",middleware.auth.tokenConfirmation ,UserController.get.profile); // 유저 프로필 존재여부 검사