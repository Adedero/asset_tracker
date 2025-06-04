import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import fs from "fs";
import path from "path";
import { HttpException } from "#src/lib/api/http";

export default api(
  {
    group: "/admins/me",
    path: "/database/backups/:filename",
    method: "delete"
  },
  defineHandler(async (req) => {
    const { filename } = req.params;
    const backupDir = path.resolve("database/backups");

    if (!fs.existsSync(backupDir)) {
      throw HttpException.notFound("No backups have been created");
    }
    fs.unlinkSync(path.join(backupDir, filename));

    return {
      success: true,
      message: "Backup deleted"
    };
  })
);
