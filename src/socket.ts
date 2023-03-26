import { app } from "./app";
import { User } from "./models/entity/User";
import { ChatRoom } from "./models/entity/ChatRoom";
import { AppDataSource } from "./models/data-source";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
const server = createServer(app);
const userRepository = AppDataSource.getRepository(User);
const chatRoomRepository = AppDataSource.getRepository(ChatRoom);
let roomId: number;
let roomIdStr: string;

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

    chatUserList.push({ userNickname, socketId: socket.id });
    console.log("chatUserList는 이것이다", chatUserList);
  });

  socket.on("requestChat", async (payload) => {
    // payload: requestingSocketId, userNickname ,requestedNickname

    // 요청한 유저
    const requestingNickname = payload.userNickname;
    // 요청받은 유저
    const { requestedNickname } = payload;

    // let requestedUser: string;
    let requestedUserSocket: string;

    for (let i = 0; i < chatUserList.length; i++) {
      if (chatUserList[i].userNickname === requestedNickname) {
        // requestedUser = chatUserList[i].userNickname;
        requestedUserSocket = chatUserList[i].socketId;
      }
    }

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
      `${birth_year},${gender},${status_msg},${region},${requestingNickname},${requestingSocketId},${requestedNickname}`
    );
  });

  socket.on("alarmReqDenied", async (payload) => {
    const arr = payload.split(",");

    const reqUserNickname = arr[0];
    const reqUserSocketId = arr[1];
    const requestedNickname = arr[2];

    console.log("payload는 이것이다!!!", payload);
    console.log(reqUserNickname);
    console.log(reqUserSocketId);
    console.log(requestedNickname);

    // 요청 거절 시 요청한 유저와 요청받은 유저의 대화 중 여부를 대화요청으로 바꾸기

    const reqUser = await userRepository.findOne({
      where: {
        nickname: reqUserNickname,
      },
    });

    reqUser!.on_chat = 0;
    await userRepository.save(reqUser!);

    const requestedUser = await userRepository.findOne({
      where: {
        nickname: requestedNickname,
      },
    });

    requestedUser!.on_chat = 0;
    await userRepository.save(requestedUser!);

    io.to(reqUserSocketId!).emit(
      "getDenialAlarm",
      "대화 요청이 거절되었어요! 다음에 시도해보세요"
    );
  });

  // 대화 요청 승인 시 상대방도 요청한 사람도 대화방에 보내도록 하기
  socket.on("acceptChatRep", async (payload) => {
    const arr = payload.split(",");

    const reqUserNickname = arr[0];
    const reqUserSocketId = arr[1];
    const requestedNickname = arr[2];

    // 승인 시 방을 생성하고 해당 방에 둘을 넣어줘야 함, 똑같은 chat.html이어도 연결된 유저끼리만 나오도록 하기



    io.to(reqUserSocketId!).emit(
      "getAcceptedAlarm",
      "대화 요청이 승인되었습니다!"
    );
  });

   // 둘의 대화를 위한 새로운 방 생성 후 방에 입장

   socket.on("joinChat", () => {
    const chatRoom = new ChatRoom();

    roomId = chatRoom.id;
    

    // roomId = payload.roomId;
    // console.log("roomId는 이것입니다!", roomId, "type:", typeof roomId);

    // chattingUsers[roomId].push(socket.id);

    // if (chattingUsers[roomId]) {
    //   // 기존 참가자 있음
    //   chattingUsers[roomId].push(socket.id);
    // } else {
    //   // 첫 참가자
    //   chattingUsers[roomId] = [socket.id];
    // }

    roomIdStr = roomId.toString();
    socket.join(roomIdStr);
    // console.log("유저가 join에 성공하였습니다! chattingUsers 리스트는 이겁니다", chattingUsers);
    console.log(socket.rooms);
  });

  socket.on("disconnecting", async (reason) => {
    console.log("disconnecting이 먼저 실행되고 있습니다.");
    // console.log("Reason은 이것입니다.", reason);

    socket.leave(roomIdStr);
    // console.log("chattingUsers리스트에 남은 목록입니다", chattingUsers);
    console.log(
      "disconnecting할 때 leave 하면서 보여주는 room 리스트",
      socket.rooms
    );

    // 요청받은 유저 혹은 요청한 유저가 갑자기 브라우저 종료 시 on_chat을 0으로 바꿔주기
    let leavingNickname;
    for (let i = 0; i < chatUserList.length; i++) {
      if (chatUserList[i].socketId === socket.id) {
        
        leavingNickname = chatUserList[i].userNickname;
        // 소켓연결 해제 시 배열에서 자신을 지움
        chatUserList.splice(i,1)
      }
    }

    const leavingUser = await userRepository.findOne({
      where: {
        nickname: leavingNickname,
      },
    });
    leavingUser!.on_chat = 0;

    await userRepository.save(leavingUser!);

  });

  socket.on("disconnect", (reason) => {
    console.log("disconnect가 나중에 실행되었습니다.");
    console.log("Reason은 이것입니다.", reason);
  });
});

export { server };
