import { app } from "./app";
import { User } from "./models/entity/User";
import { AppDataSource } from "./models/data-source";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
const server = createServer(app);
const userRepository = AppDataSource.getRepository(User);

// 채팅방 리스트에 있는 유저
const chatUserList: string[] = [];

// 활용가능 인터페이스 설정 예시
// interface ClientToServerEvents {
//   joinChat: () => void;
// }

// interface InterServerEvents {
//   ping: () => void;
// }

// interface SocketData {
//   name: string;
//   age: number;
// }

// const io = new Server<ClientToServerEvents, InterServerEvents, SocketData>(
//   server,
//   {
//     cors: {
//       origin: "*",
//     },
//   }
// );

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// const chattingUsers: any = {}; /* any를 하지 않으면 Property 'push' does not exist on type '{}',
// 컴파일 단계에서 property가 존재하는 지 체크하기에 .push를 프로퍼티로 보고 에러 발생시킴 */

io.on("connection", (socket: Socket) => {
  console.log("서버측 socket.io 실행", socket.id);

  chatUserList.push(socket.id);
  console.log("chatUserList는 이것이다", chatUserList);

  socket.on("logCheck", (msg) => {
    console.log(`${msg}`, socket.rooms);
    console.log(socket.id);
  });

  socket.on("requestChat", async (payload) => {
    // requestingSocketId, requestedNickname
    const { requestingSocketId } = payload;
    const requestingNickname = payload.userNickname;

    const requestingUser = await userRepository.findOne({
      where: {
        nickname: requestingNickname,
      },
      relations: {
        profile: true,
      },
    });
    const { birth_year } = requestingUser!.profile;
    const { gender } = requestingUser!.profile;
    const { status_msg } = requestingUser!.profile;
    const { region } = requestingUser!.profile;

    const requestedSocketId = socket.id;

    // 알람이 요청받은 사람에게 가지 않음, 페이로드도 제대로 가지 않음
    io.to(requestedSocketId).emit("checkRequest", { 
      birth_year,
      gender,
      status_msg,
      region,
      requestingSocketId,
    });
  });

  let roomId: string;
  // let roomIdStr: string;
  socket.on("joinChat", (payload) => {
    roomId = payload.roomId;
    console.log("roomId는 이것입니다!", roomId, "type:", typeof roomId);

    // chattingUsers[roomId].push(socket.id);

    // if (chattingUsers[roomId]) {
    //   // 기존 참가자 있음
    //   chattingUsers[roomId].push(socket.id);
    // } else {
    //   // 첫 참가자
    //   chattingUsers[roomId] = [socket.id];
    // }

    // // roomIdStr = roomId.toString();
    socket.join(roomId);
    // console.log("유저가 join에 성공하였습니다! chattingUsers 리스트는 이겁니다", chattingUsers);
    console.log(socket.rooms);
  });

  socket.on("disconnecting", (reason) => {
    console.log("disconnecting이 먼저 실행되고 있습니다.");
    console.log("Reason은 이것입니다.", reason);

    socket.leave(roomId);
    // console.log("chattingUsers리스트에 남은 목록입니다", chattingUsers);
    console.log(
      "disconnecting할 때 leave 하면서 보여주는 room 리스트",
      socket.rooms
    );
  });

  socket.on("disconnect", (reason) => {
    console.log("disconnect가 나중에 실행되었습니다.");
    console.log("Reason은 이것입니다.", reason);
  });
});

export { server };
