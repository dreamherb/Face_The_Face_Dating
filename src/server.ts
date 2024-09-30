import { server } from "./socket";
import dotenv from "dotenv";
dotenv.config();

server.listen(process.env.PORT, () => {
  console.log("Face The Face Dating is running on PORT =", process.env.PORT);
});
