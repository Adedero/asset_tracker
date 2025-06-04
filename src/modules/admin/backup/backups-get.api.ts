import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import path from "node:path";
import fs from "fs";
import { ApiResponse } from "#src/types/api-response";

export interface BackupsGetApiResponse extends ApiResponse {
  files: {
    filename: string;
    createdAt: Date;
  };
}
export default api(
  {
    group: "/admins/me",
    path: "/database/backups"
  },
  defineHandler(async () => {
    const backupDir = path.resolve("database/backups");

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const files = fs
      .readdirSync(backupDir)
      .filter((file) => file.endsWith("backup.db"))
      .map((file) => {
        // Assuming filename format: "timestamp-backup.db"
        const [createdAtStr] = file.split("-");
        const createdAt = new Date(Number(createdAtStr));

        return {
          filename: file,
          createdAt
        };
      });

    return {
      success: true,
      files
    };
  })
);
