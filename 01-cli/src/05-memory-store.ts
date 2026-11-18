import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { loadDocuments, splitDocuments } from "./load";

const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
const chunks = await splitDocuments(await loadDocuments());

const store = await MemoryVectorStore.fromDocuments(chunks, embeddings);
const results = await store.similaritySearchWithScore("Коли можна викочувати нову версію?", 3);

for (const [doc, score] of results) {
  console.log(score.toFixed(3), doc.metadata.source, "|", doc.pageContent.slice(0, 60));
}
