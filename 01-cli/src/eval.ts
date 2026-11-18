import { readFile } from "node:fs/promises";
import { getVectorStore } from "./store";
import { answerChain, formatContext } from "./rag";

type GoldenCase = { question: string; source: string | null };

const K = 4;
const cases: GoldenCase[] = JSON.parse(await readFile("golden.json", "utf8"));
const store = await getVectorStore();
const retriever = store.asRetriever({ k: K });

// 1. Пошук: чи є правильний файл серед K знайдених фрагментів
const answerable = cases.filter((c) => c.source !== null);
let hits = 0;
for (const c of answerable) {
  const sources = (await retriever.invoke(c.question)).map((doc) => doc.metadata.source);
  if (sources.includes(c.source)) {
    hits++;
  } else {
    console.log(`✗ ${c.question}\n  очікували ${c.source}, знайшли: ${sources.join(", ")}`);
  }
}
console.log(`\nhit rate@${K}: ${Math.round((hits / answerable.length) * 100)}% (${hits}/${answerable.length})`);

// 2. Генерація: на питання без відповіді асистент має чесно сказати «не знайшов»
console.log("\nПитання без відповіді в базі:");
for (const c of cases.filter((c) => c.source === null)) {
  const docs = await retriever.invoke(c.question);
  const answer = await answerChain.invoke({ question: c.question, context: formatContext(docs) });
  console.log(`? ${c.question}\n  ${answer}`);
}

await store.end();
