// shared/lib/file/get-md-file.ts
import { readFile } from "fs/promises";
import path from "path";

type MdFileOptions = {
  fileName: string;
  type: "privacy" | "terms";
};

const getMdFile = async ({
  fileName,
  type,
}: MdFileOptions): Promise<string> => {
  try {
    const filePath = path.join(
      process.cwd(),
      "data/legal",
      type,
      `${fileName}.md`
    );
    return await readFile(filePath, "utf-8");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load ${type}/${fileName}.md: ${errorMessage}`);
  }
};

export default getMdFile;
