import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  @Inject(ChatService)
  private readonly chatService: ChatService;

  @Get()
  async test() {
    console.log('test api');
    const sockets = await this.chatService.socket.fetchSockets();
    for (const socket of sockets) {
      console.log(socket.id);
      console.log(socket.handshake);
      console.log(socket.rooms);
      console.log(socket.data);
    }

    return HttpStatus.OK;
  }
}
