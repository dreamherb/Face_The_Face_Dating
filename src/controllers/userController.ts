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

      const profile = new Profile();

      const targetUser = await userRepository.findOneBy({
        user_no: user.user_no,
      });

      profile.gender = gender;
      profile.birth_year = birthYear;
      profile.region = region;
      profile.status_msg = statusMsg;

      targetUser!.profile = profile;
      console.log("targetUser는 이거다!", targetUser);

      await userRepository.save(targetUser!); // entity에서 cascade 옵션을 주었기에 user만 저장해도 profile까지 같이 저장된다.

      return res.json({
        isSuccess: true,
        msg: "프로필 저장에 성공하였습니다!",
      });
    }
  ),
};

const get = {
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

      if (!targetUser!.profile.id) {
        return res.json({
          isSuccess: false,
          isExist: false,
        });
      }

      return res.status(200).json({
        isSuccess: true,
        isExist: true,
      });
    }
  ),

  nickname: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;
      const { nickname } = user;
      return res.status(200).json({
        isSuccess: true,
        nickname,
      });
    }
  ),

  userList: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;

      const userList = await userRepository.find({
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

      // const userListWithoutMe = userList.filter(
      //   (v) => v.user_no !== user.user_no
      // );

      return res.status(200).json({
        isSuccess: true,
        userList: userList,
      });
    }
  ),
};

const update = {
  profile: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
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

export { get, create, update };
