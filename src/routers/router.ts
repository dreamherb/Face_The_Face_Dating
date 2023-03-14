import express, { Router } from "express";
export const router: Router = express.Router();

import * as middleware from "../../utils/middleware";
import * as AuthController from "../controllers/authController";
import * as UserController from "../controllers/userController";

// /api/auth
router.post("/auth/new_user", AuthController.createUser.local); // 회원가입
router.post("/auth/login", AuthController.logIn.local); // 로그인
router.patch("/auth/logout", middleware.auth.tokenConfirmation, AuthController.logOut.local); // 로그아웃

// /api/user
router.get("/user/profile",middleware.auth.tokenConfirmation ,UserController.get.profile); // 유저 프로필 존재여부 검사
router.get("/user/info", middleware.auth.tokenConfirmation, UserController.get.nickname); // 유저 닉네임 조회
router.post("/user/new_profile",middleware.auth.tokenConfirmation, UserController.create.profile ) // 프로필 생성
router.patch("/user/profile_update",middleware.auth.tokenConfirmation, UserController.update.profile ) // 프로필 수정
router.patch("/user/refreshed_timeLog", middleware.auth.tokenConfirmation, UserController.update.pageRefreshedTime) // 채팅리스트 새로고침 시간 업데이트
router.get("/user/user_list", middleware.auth.tokenConfirmation, UserController.get.userList) // 접속한 유저 리스트 가져오기