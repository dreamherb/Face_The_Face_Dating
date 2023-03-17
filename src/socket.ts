import { app } from "./app";
import { User } from "./models/entity/User";
import { AppDataSource } from "./models/data-source";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
const server = createServer(app);
const userRepository = AppDataSource.getRepository(User);

// 채팅방 리스트에 있는 유저
type ChatUserList = { userNickname: string; socketId: string };

const chatUserList: ChatUserList[] = [];

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

  socket.on("sendNickname", (payload) => {
    const { userNickname } = payload;
    console.log("payload는 이것이다!", payload);

    chatUserList.push({ userNickname, socketId: socket.id }); // 소켓연결 해제시 배열에서 자신을 찾아 지우는 코드도 구현 필요
    console.log("chatUserList는 이것이다", chatUserList);
  });

  socket.on("requestChat", async (payload) => {
    // payload: requestingSocketId, userNickname ,requestedNickname

    // 요청한 유저
    const requestingNickname = payload.userNickname;
    // 요청받은 유저
    const { requestedNickname } = payload;

    let requestedUser: string;
    let requestedUserSocket: string;

    for (let i = 0; i < chatUserList.length; i++) {
      if (chatUserList[i].userNickname === requestedNickname) {
        requestedUser = chatUserList[i].userNickname;
        requestedUserSocket = chatUserList[i].socketId;
      }
    }

    console.log("requestedUser는 이거다!!!", requestedUser!);
    console.log("requestedUserSocket는 이거다!!!", requestedUserSocket!);

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

    const requestingSocketId = socket.id;

  /* 개선 전 */
  // 서로에게 알람이 뜨기는 하지만 payload가 제대로 전달되지 않는다! => 원래 io.to().emit()을 사용하면 payload는 보낼 수 없나?
  //   io.to(requestedUserSocket!).emit("checkRequest", {
  //     birth_year,
  //     gender,
  //     status_msg,
  //     region,
  //     requestingSocketId,
  //   });
  // });

    /* 개선 후 */
    // 문법을 검색하면 다음의 형태처럼 문자열 메시지를 보낼 수 있는 듯 하다. io.to(socketID).emit('testEvent', 'yourMessage');
    // 그래서 아래의 코드는 성공적으로 전달된다!
    io.to(requestedUserSocket!).emit(
      "checkRequest",
      `${birth_year},${gender},${status_msg},${region},${requestingNickname},${requestingSocketId}`
    );
  });


  let roomId: string;
  // let roomIdStr: string;
  socket.on("joinChat", (payload) => {
    roomId = payload.roomId;
    // console.log("roomId는 이것입니다!", roomId, "type:", typeof roomId);

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
    // console.log("Reason은 이것입니다.", reason);

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
