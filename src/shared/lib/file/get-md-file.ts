import { readFile } from "fs/promises";
import path from "path";

const getMdFile = async ({
  fileName,
  type,
}: {
  fileName: string;
  type: "privacy" | "terms";
}) => {
  const filePath = path.join(
    process.cwd(),
    "data/legal",
    type,
    `${fileName}.md`
  );
  return await readFile(filePath, "utf-8");
};

export default getMdFile;
