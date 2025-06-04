import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import path from "node:path";
import fs from "fs";
import { ApiResponse } from "#src/types/api-response";
import { HttpException } from "#src/lib/api/http";

export interface BackupsGetApiResponse extends ApiResponse {
  files: {
    filename: string;
    createdAt: Date;
  };
}
export default api(
  {
    group: "/admins/me",
    path: "/database/backups/:filename"
  },
  defineHandler(async (req, res) => {
    const { filename } = req.params;
    const backupDir = path.resolve("database/backups");
    const filepath = path.join(backupDir, filename);

    if (!fs.existsSync(filepath)) {
      throw HttpException.notFound("Backup not found");
    }

    // Set headers for file download
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filepath);

    // Pipe file stream to response
    fileStream.pipe(res);

    // Return a promise that resolves when the streaming finishes
    return new Promise<void>((resolve, reject) => {
      fileStream.on("end", () => resolve());
      fileStream.on("error", (err) => reject(err));
    });
  })
);
