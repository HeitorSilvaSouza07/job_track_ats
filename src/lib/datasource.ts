import "reflect-metadata";
import { DataSource } from "typeorm";
import { Job } from "@/entities/Job";
import { Resume } from "@/entities/Resume";

declare global {
  // eslint-disable-next-line no-var
  var __atsDataSource: DataSource | undefined;
}

const createDataSource = () =>
  new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [Job, Resume],
    synchronize: false,
    logging: false
  });

export const AppDataSource = globalThis.__atsDataSource ?? createDataSource();

if (process.env.NODE_ENV !== "production") {
  globalThis.__atsDataSource = AppDataSource;
}

export async function getDataSource(): Promise<DataSource> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
}
