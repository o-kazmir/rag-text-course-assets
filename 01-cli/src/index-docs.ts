import { loadDocuments, splitDocuments } from "./load";
import { getVectorStore } from "./store";

const store = await getVectorStore();
const docs = await loadDocuments();

for (const doc of docs) {
  const chunks = await splitDocuments([doc]);
  // Спершу прибираємо старі фрагменти цього файлу, щоб повторний запуск не дублював їх
  await store.delete({ filter: { source: doc.metadata.source } });
  await store.addDocuments(chunks);
  console.log(`${doc.metadata.source}: ${chunks.length} фрагментів`);
}

await store.end();
