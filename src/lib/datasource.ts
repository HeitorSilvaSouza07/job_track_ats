import "reflect-metadata";
import { DataSource } from "typeorm";
import { Job } from "@/entities/Job";
import { Resume } from "@/entities/Resume";

declare global {
  // eslint-disable-next-line no-var
  var __atsDataSource: DataSource | undefined;
}

const normalizeDatabaseUrl = (databaseUrl?: string) => {
  if (!databaseUrl) {
    return undefined;
  }

  try {
    const url = new URL(databaseUrl);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("channel_binding");
    return url.toString();
  } catch {
    return databaseUrl;
  }
};

const isPostgresDatabaseUrl = (databaseUrl?: string) => {
  if (!databaseUrl) {
    return false;
  }

  try {
    const url = new URL(databaseUrl);
    return url.protocol === "postgres:" || url.protocol === "postgresql:";
  } catch {
    return false;
  }
};

const createDataSource = () => {
  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

  if (!databaseUrl || !isPostgresDatabaseUrl(databaseUrl)) {
    throw new Error(
      "DATABASE_URL must point to a PostgreSQL database (Neon). This app does not use local persistence."
    );
  }

  const shouldUseSsl = Boolean(
    databaseUrl?.includes("neon.tech") || databaseUrl?.includes("sslmode=")
  );

  return new DataSource({
    type: "postgres",
    url: databaseUrl,
    entities: [Job, Resume],
    synchronize: false,
    logging: false,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
  });
};

export const AppDataSource = globalThis.__atsDataSource ?? createDataSource();

if (process.env.NODE_ENV !== "production") {
  globalThis.__atsDataSource = AppDataSource;
}

export async function getDataSource(): Promise<DataSource> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Configure your Neon PostgreSQL connection string.");
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
}
