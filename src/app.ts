import express from "express";
const app: express.Application = express();
import {router} from './routers/router'
import * as dotenv from "dotenv";
import { MySQLconnect } from "./models";
dotenv.config();

//MySQL connection
MySQLconnect();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// html 파일과 연결
app.use(express.static("public"));

// Router url default route setting
app.use("/api", router);

// get
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("hello express");
});


// 3000 포트로 서버 실행
app.listen(process.env.PORT, () => {
  console.log(process.env.PORT, "번 에서 실행중");
});

// export { app };
