import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "../../utils/util";
import { User } from "../models/entity/User";
import { Profile } from "../models/entity/Profile";
import { AppDataSource } from "../models/data-source";
import * as dotenv from "dotenv";
dotenv.config();
const userRepository = AppDataSource.getRepository(User);

const create = {
  profile: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;
      const { gender, region, birthYear, statusMsg } = req.body;

      if (gender === "Choose...") {
        return res.json({
          isSuccess: false,
          msg: "성별을 선택해주세요.",
        });
      }

      const yearRegExp: RegExp = /([12][0-9][0-9][0-9])/g;
      if (!yearRegExp.test(birthYear) || !(birthYear.length === 4)) {
        return res.json({
          isSuccess: false,
          msg: "출생연도를 제대로 입력해주세요.",
        });
      }

      if (region === "Choose...") {
        return res.json({
          isSuccess: false,
          msg: "지역을 선택해주세요.",
        });
      }

      console.log(gender, "gender 는 이거다");
      console.log(birthYear, "birthYear 는 이거다");
      console.log(region, "region 는 이거다");
      console.log(statusMsg, "statusMsg 는 이거다");

      const targetUser = await userRepository.findOne({
        where: {
          user_no: user.user_no,
        },
        relations: {
          profile: true,
        },
      });

      targetUser!.profile.gender = gender;
      targetUser!.profile.birth_year = birthYear;
      targetUser!.profile.region = region;
      targetUser!.profile.status_msg = statusMsg;

      await userRepository.save(targetUser!); // entity에서 cascade 옵션을 주었기에 user만 저장해도 profile까지 같이 저장된다.

      return res.json({
        isSuccess: true,
        msg: "프로필 저장에 성공하였습니다!",
      });
    }
  ),
};

const read = {
  profile: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;

      const targetUser = await userRepository.findOne({
        where: {
          user_no: user.user_no,
        },
        relations: {
          profile: true,
        },
      });

      if (targetUser!.profile.birth_year === "1") {
        return res.json({
          isSuccess: false,
          isExist: false,
        });
      }

      return res.status(200).json({
        isSuccess: true,
        isExist: true,
        userNickname: targetUser!.nickname,
      });
    }
  ),

  userInfo: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;
      const targetUser = await userRepository.findOne({
        where: {
          user_no: user.user_no,
        },
        relations: {
          profile: true,
        },
      });

      return res.status(200).json({
        isSuccess: true,
        user: targetUser,
      });
    }
  ),

  userList: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;

      const targetUser = await userRepository.findOne({
        where: {
          user_no: user.user_no,
        },
      });

      const userList = await userRepository.find({
        select: {
          nickname: true,
        },
        where: {
          loginStatus: 1,
        },
        relations: {
          profile: true,
        },
        order: {
          page_refreshed_time: "DESC",
        },
      });

      if (!userList) {
        console.log("userlist가 조회되지 않았습니다!");
      }

      const userListWithoutMe = userList.filter(
        (v) => v.nickname !== targetUser!.nickname
      );

      return res.status(200).json({
        isSuccess: true,
        userList: userListWithoutMe,
      });
    }
  ),

  tokenExpirationCheck: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      return res.status(200).json({
        isSuccess: true,
      });
    }
  ),
};

const update = {
  profile: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;
      const { gender, region, birthYear, statusMsg } = req.body;

      const yearRegExp: RegExp = /([12][0-9][0-9][0-9])/g;
      if (!yearRegExp.test(birthYear) || !(birthYear.length === 4)) {
        return res.json({
          isSuccess: false,
          msg: "출생연도를 제대로 입력해주세요.",
        });
      }

      const targetUser = await userRepository.findOne({
        where: {
          user_no: user.user_no,
        },
        relations: {
          profile: true,
        },
      });

      targetUser!.profile.gender = gender;
      targetUser!.profile.birth_year = birthYear;
      targetUser!.profile.region = region;
      targetUser!.profile.status_msg = statusMsg;

      console.log("수정할떄 targetUser는 이거다!", targetUser);

      await userRepository.save(targetUser!); // entity에서 cascade 옵션을 주었기에 user만 저장해도 profile까지 같이 저장된다.

      return res.json({
        isSuccess: true,
        msg: "프로필 수정에 성공하였습니다!",
      });
    }
  ),

  pageRefreshedTime: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;
      const { pageRefreshingMoment } = req.body;

      const targetUser = await userRepository.findOneBy({
        user_no: user.user_no,
      });

      targetUser!.page_refreshed_time = pageRefreshingMoment;
      await userRepository.save(targetUser!);

      console.log("서버 측에서 유저 시간이 제대로 저장되었습니다.");
      return res.json({
        isSuccess: true,
      });
    }
  ),
};

export { read, create, update };
