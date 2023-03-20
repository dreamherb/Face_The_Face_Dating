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

      //   //요청한 유저의 on_chat여부 검사
      //   if (requestingUser.on_chat === 1) {
      //     return res.status(200).json({
      //       isSuccess: false,
      //       msg: "대화 요청으로 대기 중입니다. 대기중에는 다른 요청을 주고 받을 수 없습니다.",
      //     });
      //   }

      // 요청받은 유저의 onChat 여부 검사

      const requestedUser = await userRepository.findOneBy({
        nickname: requestedUserNickname,
      });

      // 요청받은 유저가 이미 요청을 받았거나 대화중이라면
      if (requestedUser!.on_chat === 1) {
        return res.status(200).json({
          isSuccess: false,
          msg: "이미 대화 중인 유저입니다.",
        });
      }

      requestedUser!.on_chat === 1;
      await userRepository.save(requestedUser!);

      return res.status(200).json({
        isSuccess: true,
        msg: "",
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
        return res.status(200).json({
          isSuccess: false,
          msg: "현재 승인 대기중인 요청 건이 있습니다. 최대 20초까지 대기가 필요합니다.",
        });
      }

      requestingUser!.on_chat === 1;
      await userRepository.save(requestingUser!);

      return res.status(200).json({
        isSuccess: true,
      });
    }
  ),
};

export { read, update };
