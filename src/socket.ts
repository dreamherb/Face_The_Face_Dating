import { app } from "./app";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
const server = createServer(app);

// 활용가능 인터페이스 설정 예시
interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

const io = new Server<ClientToServerEvents, InterServerEvents, SocketData>(
  server,
  {
    cors: {
      origin: "*",
    },
  }
);

io.on("connection", (socket: Socket) => {
  console.log("서버측 socket.io 실행", socket.id);

  socket.on("disconnecting", (reason) => {
    console.log("disconnecting이 먼저 실행되고 있습니다.");
    console.log("Reason은 이것입니다.", reason);
  });

  socket.on("disconnect", (reason) => {
    console.log("disconnect가 나중에 실행되었습니다.");
    console.log("Reason은 이것입니다.", reason);
  });
});

export { server };
