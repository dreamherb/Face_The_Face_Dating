import "reflect-metadata"
import { DataSource } from "typeorm"
import * as dotenv from 'dotenv'
dotenv.config()

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.FACE_THE_FACE_DATING_DB_HOST,
    port: 3306,
    username: process.env.FACE_THE_FACE_DATING_DB_USERNAME,
    password: process.env.FACE_THE_FACE_DATING_DB_PASSWORD,
    database: "face-the-face-dating",
    synchronize: true, // true로 해놓을 경우 스키마가 변경될 시 기존의 데이터가 삭제되는 경우가 있어 produnction 환경에서는 사용하지 않는 것이 좋음
    logging: false,
    entities: [__dirname + "/entity/*.{js, ts}"],
    migrations: [__dirname + "/migration/**"],
    subscribers: [],
})
