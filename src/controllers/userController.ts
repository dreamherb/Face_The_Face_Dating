import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "../../utils/util";
import { User } from "../models/entity/User";
import { AppDataSource } from "../models/data-source";
import * as dotenv from "dotenv";
dotenv.config();

// 유저 프로필 여부 확인
const get = {
  profile: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;

      if (!user.profileId) {
        return {
          isExist: false,
        };
      }

      return res.status(200).json({
        isExist: true,
      });
    }
  ),
};

export { get };
