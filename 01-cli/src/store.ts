import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";

export const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });

export function getVectorStore() {
  return PGVectorStore.initialize(embeddings, {
    postgresConnectionOptions: { connectionString: process.env.DATABASE_URL },
    tableName: "chunks",
    distanceStrategy: "cosine",
  });
}
