import { readFile } from "fs/promises";
import path from "path";

const getJsonFile = async (fileName: string) => {
  try {
    const filePath = path.join(process.cwd(), "data/legal", `${fileName}.json`);
    return await readFile(filePath, "utf-8").then(JSON.parse);
  } catch (error) {
    throw new Error(`Failed to load ${fileName}: ${error}`);
  }
};

export default getJsonFile;
