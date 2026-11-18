import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Response } from "express";
import { ChatDto } from "./chat.dto.js";
import { RagService } from "./rag.service.js";

@Controller("api/chat")
@UseGuards(ThrottlerGuard)
export class ChatController {
  constructor(private readonly rag: RagService) {}

  @Post()
  async chat(@Body() dto: ChatDto, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();

    // Користувач закрив вкладку - зупиняємо генерацію і не платимо за непрочитані токени
    const abort = new AbortController();
    res.on("close", () => abort.abort());

    for await (const event of this.rag.answer(dto.question, dto.history, abort.signal)) {
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
    }
    res.end();
  }
}
