// MySQL과 연결

import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

export const MySQLconnect = () => {
  AppDataSource.initialize()
    .then(async () => {
      console.log("DB가 연결되었어요!");

      console.log("Inserting a new user into the database...");
      const user = new User();
      // user.firstName = "Testing"
      // user.lastName = "Saw"
      // user.age2 = 27
      // user.test = "test"

      const userRepository = AppDataSource.getRepository(User);

      // await userRepository.save(user)
      // console.log("User has been saved")

      const savedUsers = await userRepository.find();
      console.log(savedUsers, "savedUsers는 이거다!");
    })
    .catch((error) => console.log(error));
};
