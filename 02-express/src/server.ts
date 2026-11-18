import express from "express";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getVectorStore } from "./store";
import { answerChain, formatContext, model } from "./rag";

type Message = { role: "user" | "assistant"; content: string };

const retriever = (await getVectorStore()).asRetriever({ k: 4 });

const rephraseChain = ChatPromptTemplate.fromMessages([
  ["system", "Переформулюй останнє питання так, щоб воно було зрозумілим без історії розмови. Поверни лише питання."],
  ["human", "Історія:\n{history}\n\nОстаннє питання: {question}"],
])
  .pipe(model)
  .pipe(new StringOutputParser());

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  const { question, history = [] }: { question: string; history?: Message[] } = req.body;
  // Останні 3 пари «питання - відповідь»: старіша історія рідко потрібна, а токени коштують грошей
  const recent = history.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n");

  res.setHeader("Content-Type", "text/event-stream");
  const send = (event: string, data: unknown) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const standalone = recent ? await rephraseChain.invoke({ question, history: recent }) : question;
    const docs = await retriever.invoke(standalone);
    send("sources", docs.map((doc, i) => ({ n: i + 1, title: doc.metadata.title })));

    const stream = await answerChain.stream({ question: standalone, context: formatContext(docs) });
    for await (const token of stream) send("token", token);
  } catch (error) {
    console.error(error);
    send("error", "Не вдалося отримати відповідь");
  }
  send("done", {});
  res.end();
});

app.listen(3000, () => console.log("Чат: http://localhost:3000"));
