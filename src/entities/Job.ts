import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

type ResumeRelation = {
  id: string;
  atsScore: number;
  createdAt: Date;
};

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

  @OneToMany("Resume", "job")
  resumes!: ResumeRelation[];
}
