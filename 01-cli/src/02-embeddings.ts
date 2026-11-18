import OpenAI from "openai";
import { cosine } from "./cosine";

const openai = new OpenAI();

const texts = [
  "Як оформити відпустку?",
  "Заяву на відпочинок подають через HR-портал за два тижні",
  "Деплой у production відбувається щовівторка",
];

const { data } = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: texts,
});
const [question, vacation, deploy] = data.map((item) => item.embedding);

console.log("Довжина вектора:", question.length);
console.log("питання ↔ відпочинок:", cosine(question, vacation).toFixed(3));
console.log("питання ↔ деплой:", cosine(question, deploy).toFixed(3));
