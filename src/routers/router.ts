import express, { Router } from "express";
export const router: Router = express.Router();

import * as AuthController from "../controllers/authController";

// /api/auth
router.post("/auth/user_creation", AuthController.createUser.test); // 회원가입
