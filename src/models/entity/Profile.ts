import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ length: 500 })
  // profile_image: string;

  @Column({ length: 10 })
  gender: string;

  @Column({ length: 10})
  birth_year: string;

  @Column({ length: 10 })
  region: string;

  @Column({ length: 300 })
  status_msg: string;
}
