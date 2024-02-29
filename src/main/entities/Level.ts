import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Course } from "./Course";

@Entity("levels")
export class Level extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text", { unique: true })
  name: string;

  @OneToMany(() => Course, (course) => course.level)
  courses: Course[];
}
