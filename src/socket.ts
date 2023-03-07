import { app } from "./app";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: Socket) => {
  console.log("socket.io 실행");

  
});

export { server };
