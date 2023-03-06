import express, { Router } from "express";
export const router: Router = express.Router();

import * as middleware from "../../utils/middleware";
import * as AuthController from "../controllers/authController";
import * as UserController from "../controllers/userController";

// /api/auth
router.post("/auth/new_user", AuthController.createUser.local); // 회원가입
router.post("/auth/login", AuthController.logIn.local); // 로그인

// /api/user
router.get("/user/profile",middleware.auth.tokenConfirmation ,UserController.get.profile); // 유저 프로필 존재여부 검사
router.get("/user/info", middleware.auth.tokenConfirmation, UserController.get.nickname); // 유저 닉네임 조회
router.post("/user/new_profile",middleware.auth.tokenConfirmation, UserController.create.profile ) // 프로필 생성
router.patch("/user/profile_update",middleware.auth.tokenConfirmation, UserController.update.profile ) // 프로필 수정