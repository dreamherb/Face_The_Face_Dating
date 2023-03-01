import { NextFunction, Request, Response } from "express";

// asyncWrapper, 비동기 처리와 동시에 에러 핸들링을 용이하게 해주기 위함

const asyncWrapper = (
  asyncFn: (arg0: Request, arg1: Response, arg2: NextFunction) => any
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFn(req, res, next);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        isSuccess: false,
        msg: "Internal Server Error",
      });
    }
  };
};

// 회원가입 정보 체크 정규식

const checkEmail = (email: string) => {
  const emailRegExp: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

  const isValid: boolean = emailRegExp.test(email);

  return isValid;
};

const checkNickname = (nickname: string) => {
  const nicknameRegExp: RegExp = /^([a-zA-z0-9]).{2,}$/g;

  const isValid: boolean = !nicknameRegExp.test(nickname);

  return isValid ? true : false;
};

const checkPwd = (pwd: string) => {
  const pwdRegExp: RegExp = /^[0-9a-zA-Z]{4,}$/g;

  const isValid: boolean = !pwdRegExp.test(pwd);

  return isValid ? true : false;
};

const checkPhoneNum = (phoneNum: string) => {
  const phoneNumRegExp: RegExp = /\d{2,3}-\d{3,4}-\d{4}/g;

  const isValid: boolean = !phoneNumRegExp.test(phoneNum);

  return isValid ? true : false;
};

export { asyncWrapper, checkEmail, checkNickname, checkPwd, checkPhoneNum };
