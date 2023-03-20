import express, { Router } from "express";
export const router: Router = express.Router();

import * as middleware from "../../utils/middleware";
import * as AuthController from "../controllers/authController";
import * as UserController from "../controllers/userController";
import * as ChatController from "../controllers/chatController";

// /api/auth
router.post("/auth/new_user", AuthController.createUser.local); // 회원가입
router.post("/auth/login", AuthController.logIn.local); // 로그인
router.get("/auth/logout", middleware.auth.tokenConfirmation, AuthController.logOut.local); // 로그아웃

// /api/user
router.get("/user/profile",middleware.auth.tokenConfirmation ,UserController.read.profile); // 유저 프로필 존재여부 검사
router.get("/user/info", middleware.auth.tokenConfirmation, UserController.read.userInfo); // 유저 정보 조회
router.post("/user/new_profile",middleware.auth.tokenConfirmation, UserController.create.profile ) // 프로필 생성
router.patch("/user/profile_update",middleware.auth.tokenConfirmation, UserController.update.profile ) // 프로필 수정
router.patch("/user/refreshed_timeLog", middleware.auth.tokenConfirmation, UserController.update.pageRefreshedTime) // 채팅리스트 새로고침 시간 업데이트
router.get("/user/user_list", middleware.auth.tokenConfirmation, UserController.read.userList) // 접속한 유저 리스트 가져오기

// api/chat
router.get("/chat/req_user_on_chat",middleware.auth.tokenConfirmation ,ChatController.update.onChat); // 요청하는 유저 대화 중으로 변경
router.patch("/chat/on_chat_check",middleware.auth.tokenConfirmation ,ChatController.read.onChat); // 요청받는 유저 대화 중 여부 검사


//api/token
router.get("/token/expiration_check", middleware.auth.tokenConfirmation) // 토큰 만료여부 검사