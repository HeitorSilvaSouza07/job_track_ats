import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  RelationId,
  PrimaryGeneratedColumn
} from "typeorm";

type JobRelation = {
  id: string;
  description: string;
  keywords: string[];
  createdAt: Date;
};

@Entity({ name: "resume" })
export class Resume {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "file_name", type: "varchar", length: 255 })
  fileName!: string;

  @Column({ name: "original_content", type: "text" })
  originalContent!: string;

  @Column({ name: "optimized_content", type: "text", default: "" })
  optimizedContent!: string;

  @Column({ name: "ats_score", type: "double precision", default: 0 })
  atsScore!: number;

  @ManyToOne("Job", "resumes", { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "job_id" })
  job!: JobRelation;

  @RelationId((resume: Resume) => resume.job)
  jobId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;
}
