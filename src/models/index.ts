// MySQL과 연결

import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

export const MySQLconnect = () => {
  AppDataSource.initialize()
    .then(async () => {
      console.log("DB가 연결되었어요!");
      console.log("Inserting a new user into the database...");
      const user = new User();
      const userRepository = AppDataSource.getRepository(User);
    })
    .catch((error) => console.log(error));
};
