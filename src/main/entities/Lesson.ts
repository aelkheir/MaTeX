import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Unit } from "./Unit";
import { Question } from "./Question";

@Entity("lessons")
export class Lesson extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text")
  name: string;

  @ManyToOne(() => Unit, (unit) => unit.lessons, { onDelete: "CASCADE" })
  unit: Unit;

  @OneToMany(() => Question, (question) => question.lesson)
  questions: Question[];
}
