import { server } from "./socket";
import dotenv from "dotenv";
import { User } from "./models/entity/User";
import { AppDataSource } from "./models/data-source";
dotenv.config();
const userRepository = AppDataSource.getRepository(User);

// const initUsersStatus = async () => {
//   // 모든 유저의 loginStatus 0으로 변경
//   try {
//     const users = await userRepository.find();

//     for (let i = 0; i < users.length; i++) {
//       users[i].loginStatus = 0;
//       users[i].on_chat = 0;
//     }

//     await userRepository.save(users);

//     console.log("유저 상태 초기화를 완료하였습니다.");
//   } catch (error) {
//     console.log("Error:", error);
//   }
// };

server.listen(process.env.PORT, () => {
  console.log("Face The Face Dating is running on PORT =", process.env.PORT);

  // initUsersStatus();
});
