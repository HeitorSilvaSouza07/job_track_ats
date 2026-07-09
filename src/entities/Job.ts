import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { Resume } from "./Resume";

@Entity({ name: "job" })
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  keywords!: string[];

  @Column({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @OneToMany("Resume", "job")
  resumes!: Resume[];
}
