import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/server/db/schema.prisma",
  migrations: {
    path: "src/server/db/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
