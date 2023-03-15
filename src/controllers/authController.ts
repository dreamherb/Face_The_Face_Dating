import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "../../utils/util";
import { User } from "../models/entity/User";
import { Profile } from "../models/entity/Profile";
import { AppDataSource } from "../models/data-source";
import * as dotenv from "dotenv";
dotenv.config();

const userRepository = AppDataSource.getRepository(User);

type user = {
  user_no: number;
  email: string;
  phone_num: string;
  pwd: string;
  nickname: string;
  on_chat: number;
  page_refreshed_time: Date;
};

// 회원가입 시 정보체크
class UserInfoCheck {
  constructor() {}

  checkEmail = (email: string): boolean => {
    const emailRegExp: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

    const isValid: boolean = emailRegExp.test(email);

    return isValid;
  };

  checkNickname = (nickname: string): boolean => {
    const nicknameRegExp: RegExp = /^([a-zA-z0-9]).{2,}$/g;
    const specialCharRegExp = /[!@#$%^&*()_\-+=~`{}\[\]\\|"':;<>,.\/?]/g;

    const isValid: boolean =
      nicknameRegExp.test(nickname) && !nickname.match(specialCharRegExp);

    return isValid ? true : false;
  };

  checkPwd = (pwd: string): boolean => {
    const pwdRegExp: RegExp = /^[0-9a-zA-Z]{4,}$/g;

    const isValid: boolean = pwdRegExp.test(pwd);

    return isValid ? true : false;
  };

  checkPhoneNum = (phoneNum: string): boolean => {
    const phoneNumRegExp: RegExp = /\d{2,3}-\d{3,4}-\d{4}/g;

    const isValid: boolean = phoneNumRegExp.test(phoneNum);

    return isValid ? true : false;
  };
}

// 회원가입

const createUser = {
  local: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, phoneNum, pwd, pwdConfirmation, nickname } = req.body;

      const userInfoCheck = new UserInfoCheck();

      if (!userInfoCheck.checkEmail(email)) {
        return res.json({
          isSuccess: false,
          msg: "이메일 형식이 올바르지 않습니다.",
        });
      }

      if (!userInfoCheck.checkPhoneNum(phoneNum)) {
        return res.json({
          isSuccess: false,
          msg: "전화번호 양식에 알맞지 않습니다.",
        });
      }

      if (!userInfoCheck.checkPwd(pwd)) {
        return res.json({
          isSuccess: false,
          msg: "비밀번호는 4자리 이상의 영문, 숫자만 가능합니다.",
        });
      }

      if (pwd !== pwdConfirmation) {
        return res.json({
          isSuccess: false,
          msg: "비밀번호가 일치하지 않습니다.",
        });
      }

      if (!userInfoCheck.checkNickname(nickname)) {
        return res.json({
          isSuccess: false,
          msg: "닉네임은 영문, 숫자만 가능하며 3자리이상만 가능합니다.",
        });
      }

      // 이미 존재하는지 여부 확인

      const isExistEmail: user | null = await userRepository.findOneBy({
        email,
      });

      if (isExistEmail) {
        return res.json({
          isSuccess: false,
          msg: "이미 존재하는 이메일입니다.",
        });
      }

      const isExistNickname: user | null = await userRepository.findOneBy({
        nickname,
      });

      if (isExistNickname) {
        return res.json({
          isSuccess: false,
          msg: "이미 존재하는 닉네임입니다.",
        });
      }

      // 회원 생성

      const hashedPwd: string = bcrypt.hashSync(pwd, 10);
      const user = new User();
      const profile = new Profile();

      user.email = email;
      user.phone_num = phoneNum;
      user.pwd = hashedPwd;
      user.nickname = nickname;
      user.on_chat = 0;
      user.loginStatus = 0;
      user.page_refreshed_time = new Date();
      user.profile = profile;
      user.profile.birth_year = "1";
      user.profile.gender = "1";
      user.profile.region = "1";
      user.profile.status_msg = "1";

      await userRepository.save(user);

      return res.status(201).json({
        isSuccess: true,
        msg: "회원가입에 성공하였습니다.",
      });
    }
  ),
};

// 로그인

const logIn = {
  local: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, pwd } = req.body;

      if (!email || !pwd) {
        return res.json({
          isSuccess: false,
          msg: "이메일 혹은 비밀번호를 입력하세요.",
        });
      }

      const user = await userRepository.findOneBy({
        email,
      });
      if (!user) {
        return res.json({
          isSuccess: false,
          msg: "이메일 혹은 비밀번호를 확인해주세요.",
        });
      }

      const pwdCheck = bcrypt.compareSync(pwd, user.pwd);
      if (!pwdCheck) {
        return res.json({
          isSuccess: false,
          msg: "이메일 혹은 비밀번호를 확인해주세요.",
        });
      }

      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY!, {
        expiresIn: 60 * 60 * 6,
      });

      user.loginStatus = 1;
      await userRepository.save(user);

      return res.status(200).json({
        isSuccess: true,
        token,
      });
    }
  ),
};

// 로그아웃

const logOut = {
  local: asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = res.locals;

      const targetUser = await userRepository.findOneBy({
        user_no: user.user_no,
      });

      targetUser!.loginStatus = 0;

      await userRepository.save(targetUser!);

      return res.status(200).json({
        isSuccess: true,
      });
    }
  ),
};

export { createUser, logIn, logOut };
