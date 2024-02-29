import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Level } from "./Level";
import { Unit } from "./Unit";

@Entity("courses")
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text")
  name: string;

  @OneToMany(() => Unit, (unit) => unit.course)
  units: Unit[];

  @ManyToOne(() => Level, (level) => level.courses, { onDelete: "SET NULL" })
  level: Level;
}
