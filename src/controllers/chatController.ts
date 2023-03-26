import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "../../utils/util";
import { User } from "../models/entity/User";
import { ChatRoom } from "../models/entity/ChatRoom";
import { AppDataSource } from "../models/data-source";
import * as dotenv from "dotenv";
dotenv.config();
const userRepository = AppDataSource.getRepository(User);

const read = {
  onChat: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const requestingUser = res.locals.user;
      const requestedUserNickname = req.body.requestedNickname;

      const requestedUser = await userRepository.findOneBy({
        nickname: requestedUserNickname,
      });

      // 요청받은 유저가 로그아웃한 경우

      if (requestedUser!.loginStatus === 0) {
        return res.json({
          isSuccess: false,
          msg: "로그아웃한 유저입니다. 새로 고침 후 이용하시기 바랍니다.",
        });
      }

      // 요청받은 유저가 이미 요청을 받았거나 대화중인 경우
      if (requestedUser!.on_chat === 1) {
        return res.json({
          isSuccess: false,
          msg: "이미 대화 중인 유저입니다.",
        });
      }

      requestedUser!.on_chat = 1;
      await userRepository.save(requestedUser!);

      return res.json({
        isSuccess: true,
      });
    }
  ),
};

const update = {
  onChat: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;

      const requestingUser = await userRepository.findOneBy({
        nickname: user.nickname,
      });

      // 요청하는 유저가 이미 요청을 보냈을 경우
      if (requestingUser!.on_chat === 1) {
        return res.json({
          isSuccess: false,
          msg: "현재 승인 대기중인 요청 건이 있습니다. 최대 20초까지 대기가 필요합니다.",
        });
      }

      requestingUser!.on_chat = 1;
      await userRepository.save(requestingUser!);

      return res.status(201).json({
        isSuccess: true,
      });
    }
  ),
};

export { read, update };
// 요청받은 유저가 만료일 경우는 html checkTokenExpired()로 확인이 된다면 문제 없음!