import { loadDocuments, splitDocuments } from "./load";

const docs = await loadDocuments();
const chunks = await splitDocuments(docs);

console.log(`${docs.length} документів → ${chunks.length} фрагментів\n`);
for (const chunk of chunks.slice(0, 3)) {
  console.log(`--- ${chunk.metadata.source}, ${chunk.pageContent.length} символів`);
  console.log(chunk.pageContent, "\n");
}
