import { Inject, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { ChatController } from "./chat.controller.js";
import { RagService } from "./rag.service.js";
import { CHAT_MODEL, VECTOR_STORE } from "./rag.tokens.js";

@Module({
  controllers: [ChatController],
  providers: [
    RagService,
    {
      provide: CHAT_MODEL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new ChatOpenAI({
          model: config.get("OPENAI_CHAT_MODEL", "gpt-5.4-mini"),
          apiKey: config.getOrThrow("OPENAI_API_KEY"),
        }),
    },
    {
      provide: VECTOR_STORE,
      inject: [ConfigService],
      // Та сама таблиця chunks, що й у src/store.ts: проіндексовані документи вже на місці
      useFactory: (config: ConfigService) =>
        PGVectorStore.initialize(
          new OpenAIEmbeddings({
            model: "text-embedding-3-small",
            apiKey: config.getOrThrow("OPENAI_API_KEY"),
          }),
          {
            postgresConnectionOptions: { connectionString: config.getOrThrow("DATABASE_URL") },
            tableName: "chunks",
            distanceStrategy: "cosine",
          },
        ),
    },
  ],
})
export class RagModule implements OnModuleDestroy {
  constructor(@Inject(VECTOR_STORE) private readonly store: PGVectorStore) {}

  // Закриваємо пул підключень до PostgreSQL, коли застосунок зупиняється
  onModuleDestroy() {
    return this.store.end();
  }
}
