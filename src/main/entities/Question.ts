import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Lesson } from "./Lesson";

@Entity("questions")
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text")
  text: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.questions, {
    onDelete: "CASCADE",
  })
  lesson: Lesson;
}
