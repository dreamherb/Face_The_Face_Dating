import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "./util";
import { User } from "../src/models/entity/User";
import { AppDataSource } from "../src/models/data-source";
import * as dotenv from "dotenv";
dotenv.config();

const userRepository = AppDataSource.getRepository(User);

const auth = {
  tokenConfirmation: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { authorization } = req.headers;

      if (!authorization) {
        return res.json({
          isSuccess: false,
          msg: "토큰 정보가 없습니다.",
        });
      }

      const [type, value] = authorization.split(" ");
      if (type !== "Bearer") {
        return res.json({
          isSuccess: false,
          msg: "유효하지 않은 타입의 토큰입니다.",
        });
      }

      if (!value) {
        return res.json({
          isSuccess: false,
          msg: "토큰이 없습니다.",
        });
      }

      const { email } = jwt.verify(
        value,
        process.env.JWT_SECRET_KEY!
      ) as JwtPayload;

      const user = await userRepository.findOneBy({
        email,
      });

      if (!user) {
        return res.json({
          isSuccess: false,
          msg: "유효한 값의 토큰이 아닙니다.",
          needSignOut: true,
        });
      }

      res.locals.user = user;
      next();
    }
  ),
};

export { auth };
