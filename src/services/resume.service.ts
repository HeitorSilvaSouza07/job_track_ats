import { Resume } from "@/entities/Resume";
import { getDataSource } from "@/lib/datasource";
import { Job } from "@/entities/Job";

type CreateResumeInput = {
  fileName: string;
  originalContent: string;
  optimizedContent?: string;
  atsScore: number;
  job: Job;
};

export async function createResume(input: CreateResumeInput): Promise<Resume> {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Resume);

  const resume = repository.create({
    fileName: input.fileName,
    originalContent: input.originalContent,
    optimizedContent: input.optimizedContent ?? "",
    atsScore: input.atsScore,
    job: input.job
  });

  return repository.save(resume);
}

export async function findResumeById(resumeId: string): Promise<Resume | null> {
  const dataSource = await getDataSource();
  return dataSource.getRepository(Resume).findOne({
    where: { id: resumeId },
    relations: { job: true }
  });
}

export async function updateOptimizedResume(
  resumeId: string,
  optimizedContent: string,
  atsScore: number
): Promise<Resume> {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Resume);
  const resume = await repository.findOne({ where: { id: resumeId }, relations: { job: true } });

  if (!resume) {
    throw new Error("Resume not found");
  }

  resume.optimizedContent = optimizedContent;
  resume.atsScore = atsScore;

  return repository.save(resume);
}
