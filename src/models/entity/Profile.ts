import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  profile_image: string;

  @Column({ length: 10 })
  gender: string;

  @Column({ type: "smallint" })
  birth_year: number;

  @Column({ length: 10 })
  location: string;

  @Column({ length: 300 })
  status_msg: string;
}
