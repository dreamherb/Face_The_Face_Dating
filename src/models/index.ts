// MySQL과 연결

import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

export const MySQLconnect = () => {
  AppDataSource.initialize()
    .then(async () => {
      console.log("DB가 연결되었어요!");
      const userRepository = AppDataSource.getRepository(User);

      const initUsersStatus = async () => {
        // 모든 유저의 loginStatus와 on_chat을 0으로 변경
        try {
          const users = await userRepository.find();

          for (let i = 0; i < users.length; i++) {
            users[i].loginStatus = 0;
            users[i].on_chat = 0;
          }

          await userRepository.save(users);

          console.log("유저 상태 초기화를 완료하였습니다.");
        } catch (error) {
          console.log("Error:", error);
        }
      };

      initUsersStatus();
    })
    .catch((error) => console.log(error));
};
