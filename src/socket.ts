import { app } from "./app";
import { User } from "./models/entity/User";
import { ChatRoom } from "./models/entity/ChatRoom";
import { AppDataSource } from "./models/data-source";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { AlreadyHasActiveConnectionError } from "typeorm";
const server = createServer(app);
const userRepository = AppDataSource.getRepository(User);
const chatRoomRepository = AppDataSource.getRepository(ChatRoom);
let roomId: number;
let roomIdStr: string;

// 채팅방 리스트에 있는 유저
type ChatUserList = { userNickname: string; socketId: string };
type ChatRoomList = { roomId: string; userNickname: string; socketId: string };

const chatUserList: ChatUserList[] = [];
const chatRoomList: ChatRoomList[] = [];

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

    // DB 상 ChatRoom 테이블 생성, 해당 유저 정보 넣기
    const requestingUser = await userRepository.findOne({
      where: {
        nickname: reqUserNickname,
      },
    });

    const requestedUser = await userRepository.findOne({
      where: {
        nickname: requestedNickname,
      },
    });

    const chatRoom = new ChatRoom();

    requestingUser!.chatRoom = chatRoom;
    requestedUser!.chatRoom = chatRoom;

    await userRepository.save(requestingUser!);
    await userRepository.save(requestedUser!);

    io.to(reqUserSocketId!).emit(
      "getAcceptedAlarm",
      "대화 요청이 승인되었습니다!"
    );
  });

  // 둘의 대화를 위한 새로운 방 생성 후 방에 입장

  socket.on("joinChat", () => {
    const chatRoom = new ChatRoom();

    roomId = chatRoom.id;

    roomIdStr = roomId.toString();
    socket.join(roomIdStr);
    // console.log("유저가 join에 성공하였습니다! chattingUsers 리스트는 이겁니다", chattingUsers);
    console.log(socket.rooms);
  });

  socket.on("disconnecting", async (reason) => {
    socket.leave(roomIdStr);
    console.log(
      "disconnecting할 때 leave 하면서 보여주는 room 리스트",
      socket.rooms
    );

    // 채팅 대기 유저 리스트에서 요청받은 유저 혹은 요청한 유저가 갑자기 브라우저 종료 시 on_chat과 로그인 상태를 0으로 바꿔주기
    let leavingNickname: string;
    for (let i = 0; i < chatUserList.length; i++) {
      if (chatUserList[i].socketId === socket.id) {
        leavingNickname = chatUserList[i].userNickname;
        // 소켓연결 해제 시 배열에서 자신을 지움
        chatUserList.splice(i, 1);
      }
    }

    // 채팅 중 유저가 갑자기 브라우저를 종료할 경우 DB상 정보에서 삭제 후 상대 유저 역시 방에서 exit 되도록 하기
    let leavingRoomId: string;
    for (let i = 0; i < chatRoomList.length; i++) {
      if (chatRoomList[i].socketId === socket.id) {
        leavingNickname = chatRoomList[i].userNickname;
        leavingRoomId = chatRoomList[i].roomId;
        chatRoomList.splice(i, 1);
        break;
      }
    }

    if (leavingNickname!) {
      const leavingUser = await userRepository.findOne({
        where: {
          nickname: leavingNickname,
        },
      });

      leavingUser!.on_chat = 0;
      leavingUser!.loginStatus = 0;

      // remove와 다르게 해당하는 엔터티가 없어도 에러를 발생시키지 않음
      // cf) 실무에서는 실제 테이블을 삭제하는 물리 삭제인 delete를 잘 사용하지 않음, 논리 삭제인 softDelete혹은 update쿼리로 빈값을 지정하는 방식 사용
      // await userRepository.delete({ chatRoom: leavingUser!.chatRoom }); // 이건 해당하는 유저 자체를 삭제하는 코드

      // 떠나는 유저의 채팅방을 DB상에서 삭제

      if (leavingRoomId!) {
        await chatRoomRepository.delete({ id: leavingUser!.chatRoom.id });

        io.to(leavingRoomId).emit("isUserLeft", () => {
          for (let i = 0; i < chatRoomList.length; i++) {
            if (chatRoomList[i].roomId === leavingRoomId) {
              chatRoomList.splice(i, 1);
              break;
            }
          }
        });
      }

      await userRepository.save(leavingUser!);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("disconnect가 나중에 실행되었습니다.");
    console.log("Reason은 이것입니다.", reason);
  });
});

export { server };
