import { Inject, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @Inject(ChatService)
  private readonly chatService;

  private logger: Logger = new Logger('ChatGateway');

  @WebSocketServer()
  public server;

  users = 0;
  async afterInit(server: Server) {
    this.logger.log('Initialized');
    // console.log(server);
    this.chatService.socket = server;
  }

  async handleConnection(socket: Socket) {
    console.log(socket.handshake.headers);
    this.logger.log('Client Connected');
    // console.log(client);

    // A client has connected
    this.users++;
    // Notify connected clients of current users
    this.server.emit('users', this.users);
  }
  async handleDisconnect() {
    this.logger.log('Client Disconnected');
    // console.log(client);

    // A client has disconnected
    this.users--;
    // Notify connected clients of current users
    this.server.emit('users', this.users);
  }

  @SubscribeMessage('chat')
  async onChat(client: Socket, message) {
    this.logger.log('Chat message received');
    // console.log(client);
    console.log(message);

    client.emit('echo', message);

    // client.broadcast.emit('chat', message);
  }
}
