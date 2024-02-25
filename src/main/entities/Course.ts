import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Unit } from "./Unit";

@Entity("courses")
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text")
  name: string;

  @OneToMany(() => Unit, (unit) => unit.course)
  units: Unit[];
}
