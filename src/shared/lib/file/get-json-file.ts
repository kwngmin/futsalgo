// shared/lib/file/get-json-file.ts
import { readFile } from "fs/promises";
import path from "path";

const getJsonFile = async <T = unknown>(fileName: string): Promise<T> => {
  try {
    const filePath = path.join(process.cwd(), "data/legal", `${fileName}.json`);
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load ${fileName}.json: ${errorMessage}`);
  }
};

export default getJsonFile;
