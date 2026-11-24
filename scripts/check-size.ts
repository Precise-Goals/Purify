import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB

function main() {
  let files: string[] = [];
  try {
    const stdout = execSync("git ls-files", { encoding: "utf-8" });
    files = stdout.split(/\r?\n/).filter((f) => f.trim().length > 0);
  } catch {
    console.warn("Not a git repo or git not found, skipping check-size git listing.");
    process.exit(0);
  }

  let totalSize = 0;
  for (const file of files) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      totalSize += stats.size;
    }
  }

  const totalMb = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`Repo tracked size: ${totalMb} MB (${totalSize} bytes) / 10.00 MB cap`);

  if (totalSize > MAX_TOTAL_BYTES) {
    console.error(`ERROR: Tracked files exceed 10 MB limit! Current: ${totalMb} MB`);
    process.exit(1);
  }

  console.log("Size check OK");
}

main();
