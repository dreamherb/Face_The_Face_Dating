import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { ChatRoom } from "./ChatRoom";
import { Profile } from "./Profile";

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: "int" })
  user_no: number;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile

  @Column({ length: 30 })
  user_name: string;

  @Column({ length: 20 })
  nickname: string;

  @Column({ length: 40 })
  email: string;

  @Column({ length: 20 })
  pwd: string;

  @Column({ length: 20 })
  phone_num: string;

  @Column({ type: "tinyint" })
  on_chat: number;

  @Column({ type: "timestamp" })
  page_refreshed_time: Date;

  // ChatRoom hasMany User, User belongsTo ChatRoom / ChatRoom 하나당 유저가 2명이기 때문
  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.users)
  chatRoom: ChatRoom;
}
