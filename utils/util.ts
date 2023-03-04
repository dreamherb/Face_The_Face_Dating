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
      return res.json({
        isSuccess: false,
        msg: "Internal Server Error",
      });
    }
  };
};

export { asyncWrapper };
