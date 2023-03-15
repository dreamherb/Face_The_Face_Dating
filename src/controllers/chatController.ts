import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "../../utils/util";
import { User } from "../models/entity/User";
import { ChatRoom } from "../models/entity/ChatRoom";
import { AppDataSource } from "../models/data-source";
import * as dotenv from "dotenv";
dotenv.config();
const userRepository = AppDataSource.getRepository(User);

const create = {
  request: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const requestingUser = res.locals.user;
      const { requestedUserNickname } = req.body;

      // 어떤 유저가 요청했을 때 요청받은 유저가 실시간으로 채팅요청을 받았다는 것을 어떻게 알게할까? (새로고침 없이)
      // 1) 새로고침 또는 대화요청 버튼을 누를 때마다 본인의 on_chat이 1인지 아닌지 체크한다. => 페이지가 이동하는 작업이 발생하는 모든 곳에서
      // on_chat의 여부를 체크해야한다. 사용자가 많아질수록 리소스 낭비가 심할 것으로 보이며 사용자 경험도 나빠질 수 있다.
      // 2) socket연결을 채팅방이 아니라 채팅 리스트에 들어갈 때 부터 하여 실시간으로 요청이 가능하게 한다.
      // => html페이지 간 socket 정보를 넘겨주기 힘드니 챗 리스트에서 별도의 socket 연결을 하나 생성하여 유저와의 연결용으로만 사용하면 어떨까?
    }
  ),
};

export { create };
