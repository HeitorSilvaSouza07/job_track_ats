import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Resume } from "@/entities/Resume";

@Entity({ name: "job" })
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  keywords!: string[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @OneToMany(() => Resume, (resume) => resume.job)
  resumes!: Resume[];
}
