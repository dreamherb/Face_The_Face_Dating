import express, { Router } from "express";
export const router: Router = express.Router()

import * as AuthController from "../controllers/authController"

//api/auth
// router.post("/auth/local", AuthController.create.local);   // 회원가입