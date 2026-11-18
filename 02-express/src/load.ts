import { readdir, readFile } from "node:fs/promises";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function loadDocuments(dir = "docs"): Promise<Document[]> {
  const files = (await readdir(dir)).filter((file) => file.endsWith(".md"));
  return Promise.all(
    files.map(async (file) => {
      const text = await readFile(`${dir}/${file}`, "utf8");
      const title = text.match(/^# (.+)$/m)?.[1] ?? file;
      return new Document({ pageContent: text, metadata: { source: file, title } });
    }),
  );
}

const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  chunkSize: 500,
  chunkOverlap: 80,
});

export function splitDocuments(docs: Document[]) {
  return splitter.splitDocuments(docs);
}
