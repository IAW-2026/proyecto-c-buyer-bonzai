import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "@/server/db/schema.prisma",
  migrations: {
    path: "@/server/db/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
