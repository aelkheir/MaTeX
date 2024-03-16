import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  AfterLoad,
} from "typeorm";
import { Lesson } from "./Lesson";
import { docToLatex } from "../helpers";

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

  latex: string;

  @AfterLoad()
  setComputed() {
    this.latex = docToLatex(JSON.parse(this.text));
  }
}
