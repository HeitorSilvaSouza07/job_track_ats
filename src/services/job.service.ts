import { getDataSource } from "@/lib/datasource";
import { Job } from "@/entities/Job";
import { DashboardEntry } from "@/types/ats";

export async function createJob(description: string, keywords: string[]): Promise<Job> {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Job);

  const job = repository.create({ description, keywords });
  return repository.save(job);
}

export async function findJobById(jobId: string): Promise<Job | null> {
  const dataSource = await getDataSource();
  return dataSource.getRepository(Job).findOne({
    where: { id: jobId },
    relations: { resumes: true }
  });
}

export async function listDashboardEntries(): Promise<DashboardEntry[]> {
  const dataSource = await getDataSource();
  const jobs = await dataSource.getRepository(Job).find({
    relations: { resumes: true },
    order: { createdAt: "DESC" }
  });

  return jobs.map((job) => {
    const orderedResumes = [...(job.resumes ?? [])].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
    );
    const bestScore = orderedResumes.length
      ? Math.max(...orderedResumes.map((resume) => resume.atsScore))
      : 0;

    return {
      id: job.id,
      description: job.description,
      score: orderedResumes[0]?.atsScore ?? 0,
      bestScore,
      resumeCount: orderedResumes.length,
      createdAt: job.createdAt.toISOString()
    };
  });
}
