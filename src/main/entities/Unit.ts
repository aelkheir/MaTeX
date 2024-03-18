import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Lesson } from "./Lesson";
import { Course } from "./Course";
import { Question } from "./Question";

@Entity("units")
export class Unit extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text")
  name: string;

  @OneToMany(() => Lesson, (lesson) => lesson.unit)
  lessons: Lesson[];

  @OneToMany(() => Question, (question) => question.unit)
  questions: Question[];

  @ManyToOne(() => Course, (course) => course.units, { onDelete: "CASCADE" })
  course: Course;
}
