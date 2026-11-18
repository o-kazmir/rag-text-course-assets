import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { RagModule } from "./rag/rag.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Не більше 10 питань на хвилину з однієї IP-адреси
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    RagModule,
  ],
})
export class AppModule {}
