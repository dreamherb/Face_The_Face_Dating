import express, { Router } from "express";
export const router: Router = express.Router();

import * as AuthController from "../controllers/authController";

// /api/auth
router.post("/auth/user_creation", AuthController.createUser.local); // 회원가입
router.post("/auth/login", AuthController.logIn.local); // 로그인
