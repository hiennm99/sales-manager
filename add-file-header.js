import fs from "fs";
import path from "path";

// thư mục cần scan
const SRC_ROOT = path.resolve("./src");

// regex: tìm comment header cũ ở dòng 1
const HEADER_REGEX = /^\/\/.*\n/;

function addHeaderToFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Tính path tương đối tính từ src/
  const relativePath =
    "src/" + path.relative(SRC_ROOT, filePath).replace(/\\/g, "/");

  const newHeader = `// ${relativePath}\n`;

  // --- BƯỚC 1: XÓA HEADER CŨ ---
  if (HEADER_REGEX.test(content)) {
    content = content.replace(HEADER_REGEX, ""); // xoá dòng comment ở đầu file
  }

  // --- BƯỚC 2: ADD HEADER MỚI ---
  content = newHeader + content;

  // Ghi lại file
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated header:", relativePath);
}

function walk(dir) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      addHeaderToFile(fullPath);
    }
  }
}

walk(SRC_ROOT);
console.log("✨ DONE: Updated all headers (removed old, added new)");
