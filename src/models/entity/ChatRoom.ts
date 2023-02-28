import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn({ type: "int" })
  room_num: number;

  // ChatRoom hasMany User, User belongsTo ChatRoom / ChatRoom 하나당 유저가 2명이기 때문
  @OneToMany(() => User, (user) => user.chatRoom)
  users: User[];
}
