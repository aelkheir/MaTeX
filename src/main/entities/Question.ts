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
import { Unit } from "./Unit";

@Entity("questions")
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text")
  text: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.questions, {
    onDelete: "CASCADE",
    nullable: true,
  })
  lesson: Lesson | null;

  @ManyToOne(() => Unit, (unit) => unit.questions, {
    onDelete: "CASCADE",
    nullable: true,
  })
  unit: Unit | null;

  @Column("boolean", { default: false })
  pastPaper: boolean;

  latex: string;

  @AfterLoad()
  setComputed() {
    this.latex = docToLatex(JSON.parse(this.text));
  }
}
