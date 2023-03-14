import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { ChatRoom } from "./ChatRoom";
import { Profile } from "./Profile";

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: "int" })
  user_no: number;

  @Column({ length: 40 })
  email: string;

  @Column({ length: 20 })
  phone_num: string;

  @Column()
  pwd: string;

  @Column({ length: 20 })
  nickname: string;

  @Column({ type: "tinyint" })
  on_chat: number;

  @Column({ type: "tinyint" })
  loginStatus: number;

  @Column({ type: "timestamp" })
  page_refreshed_time: Date;

  @OneToOne(() => Profile, {
    cascade: true
  })
  @JoinColumn()
  profile: Profile;

  // ChatRoom hasMany User, User belongsTo ChatRoom / ChatRoom 하나당 유저가 2명이기 때문
  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.users)
  chatRoom: ChatRoom;
}
