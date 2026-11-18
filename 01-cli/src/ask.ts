import { getVectorStore } from "./store";
import { answerChain, formatContext } from "./rag";

const question = process.argv[2];
if (!question) {
  console.error('Використання: npx tsx --env-file=.env src/ask.ts "Ваше питання"');
  process.exit(1);
}

const store = await getVectorStore();
const retriever = store.asRetriever({ k: 4 });

const docs = await retriever.invoke(question);
const answer = await answerChain.invoke({ question, context: formatContext(docs) });

console.log(answer);
console.log("\nДжерела:");
docs.forEach((doc, i) => console.log(`[${i + 1}] ${doc.metadata.title} (${doc.metadata.source})`));

await store.end();
