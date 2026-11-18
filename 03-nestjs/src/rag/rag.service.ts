import { Inject, Injectable, Logger } from "@nestjs/common";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import type { MessageDto } from "./chat.dto.js";
import { answerPrompt, formatContext, rephrasePrompt } from "./prompts.js";
import { CHAT_MODEL, VECTOR_STORE } from "./rag.tokens.js";

export type ChatEvent =
  | { type: "sources"; data: { n: number; title: string; source: string }[] }
  | { type: "token"; data: string }
  | { type: "error"; data: string }
  | { type: "done"; data: object };

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @Inject(CHAT_MODEL) private readonly model: BaseChatModel,
    @Inject(VECTOR_STORE) private readonly store: PGVectorStore,
  ) {}

  async *answer(question: string, history: MessageDto[], signal: AbortSignal): AsyncGenerator<ChatEvent> {
    const recent = history.slice(-6);
    const parser = new StringOutputParser();

    try {
      const standalone = recent.length
        ? await rephrasePrompt.pipe(this.model).pipe(parser).invoke(
            { question, history: recent.map((m) => `${m.role}: ${m.content}`).join("\n") },
            { signal },
          )
        : question;

      const docs = await this.store.asRetriever({ k: 4 }).invoke(standalone, { signal });
      yield {
        type: "sources",
        data: docs.map((doc, i) => ({ n: i + 1, title: doc.metadata.title, source: doc.metadata.source })),
      };

      const stream = await answerPrompt
        .pipe(this.model)
        .pipe(parser)
        .stream({ question: standalone, context: formatContext(docs) }, { signal });
      for await (const token of stream) yield { type: "token", data: token };
    } catch (error) {
      if (signal.aborted) return; // клієнт пішов, відповідати нікому
      this.logger.error(error);
      yield { type: "error", data: "Не вдалося отримати відповідь" };
    }

    yield { type: "done", data: {} };
  }
}
