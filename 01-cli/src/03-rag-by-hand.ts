import { readdir, readFile } from "node:fs/promises";
import OpenAI from "openai";
import { cosine } from "./cosine";

const openai = new OpenAI();

// 1. Індексація: поки що кожен файл - це один фрагмент
const docs: { source: string; text: string; vector: number[] }[] = [];
for (const file of await readdir("docs")) {
  if (!file.endsWith(".md")) continue;
  const text = await readFile(`docs/${file}`, "utf8");
  const { data } = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
  docs.push({ source: file, text, vector: data[0].embedding });
}

// 2. Пошук: два найближчі за змістом документи
const question = process.argv[2] ?? "Скільки днів оплачуваної відпустки в «Твоїй Галері»?";
const { data } = await openai.embeddings.create({ model: "text-embedding-3-small", input: question });

const top = docs
  .map((doc) => ({ ...doc, score: cosine(data[0].embedding, doc.vector) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 2);
console.log("Знайдено:", top.map((doc) => `${doc.source} (${doc.score.toFixed(3)})`).join(", "));

// 3. Генерація: відповідь лише на основі знайденого
const context = top.map((doc, i) => `[${i + 1}] ${doc.source}\n${doc.text}`).join("\n\n");

const response = await openai.responses.create({
  model: "gpt-5.4-mini",
  instructions:
    "Ти асистент компанії «Твоя Галера». Відповідай лише на основі контексту. " +
    "Якщо відповіді в контексті немає, скажи, що не знаєш. " +
    "Після кожного факту став посилання на джерело: [1], [2].",
  input: `Контекст:\n${context}\n\nПитання: ${question}`,
});
console.log(response.output_text);
