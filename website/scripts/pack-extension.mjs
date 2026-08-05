import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";

const __dirname = dirname(fileURLToPath(import.meta.url));
const websiteRoot = join(__dirname, "..");
const monorepoRoot = join(websiteRoot, "..");
const distDir = join(monorepoRoot, "extension", "dist");
const outZip = join(websiteRoot, "public", "whatnext-extension.zip");

async function main() {
  if (!existsSync(distDir)) {
    console.error(
      "extension/dist not found. Run `npm run build` from the monorepo root first.",
    );
    process.exit(1);
  }

  mkdirSync(join(websiteRoot, "public"), { recursive: true });

  const output = createWriteStream(outZip);
  const archive = archiver("zip", { zlib: { level: 9 } });

  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(distDir, false);
    archive.finalize();
  });

  console.log(`Packed ${distDir} → ${outZip}`);
}

main();
