import OpenAI from "openai";

const openai = new OpenAI(); // ключ береться зі змінної OPENAI_API_KEY

const response = await openai.responses.create({
  model: "gpt-5.4-mini",
  input: "Скільки днів оплачуваної відпустки в компанії «Твоя Галера»?",
});

console.log(response.output_text);
