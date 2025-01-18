import { HttpException, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { decrypt, encrypt } from 'src/utils/security';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SecretChatMethod } from './secret-chat.method';
import { maskEmail, stringToBuffer } from 'src/utils/methods';
import { RetMessageDto, RetMessageDtos } from './dto/ret-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService, private readonly secretChatMethod: SecretChatMethod) { }

  async gaetUserInfo(userUuid: string) {
    const uuidBuffer = stringToBuffer(userUuid);
    try {
      const auth = await this.prismaService.auth.findUnique({
        where: { uuid: uuidBuffer }
      });

      const maskedEmail = maskEmail(auth.email);

      return { uuidBuffer, uid: auth.authId, email: maskedEmail };
    } catch (error) {
      return { uuidBuffer, uid: 0, email: 'unknown' };
    }
  }

  private async saveChatToDataset(userUuid: string, userMessages: { role: string; content: string }[], botResponse: string) {
    let datasetName = 'chatbot';
    if (process.env.NEST_ENV === 'develop') {
      datasetName = 'zchatbot-test';
    }

    const { uid, email } = await this.gaetUserInfo(userUuid);

    const inputs = {
      Email: email,
      AuthId: uid,
      messages: userMessages
    };
    const outputs = {
      bot_response: botResponse
    };

    this.secretChatMethod.saveToDataset(datasetName, inputs, outputs);
  }


  private async saveChatToDatasetV2(userUuid: string, userMessages: { role: string; content: string }[], botResponse: string, roomId: number) {
    let datasetName = 'chatbot';
    if (process.env.NEST_ENV === 'develop') {
      datasetName = 'zchatbot-test';
    }

    const { uid, email } = await this.gaetUserInfo(userUuid);

    const inputs = {
      Email: email,
      AuthId: uid,
      messages: userMessages
    };
    const outputs = {
      bot_response: botResponse
    };

    await this.prismaService.room.update({
      where: {
        roomId
      },
      data: {
        updatedAt: new Date()
      }
    });

    // 메시지 암호화
    const encryptedMessageBuffer = encrypt(userMessages.at(-1).content);
    const encryptedBotResponseBuffer = encrypt(botResponse);

    await this.prismaService.message.create({
      data: {
        roomId: roomId,
        isUser: true,
        encryptedContent: encryptedMessageBuffer
      }
    });

    await this.prismaService.message.create({
      data: {
        roomId: roomId,
        encryptedContent: encryptedBotResponseBuffer
      }
    });


    this.secretChatMethod.saveToDataset(datasetName, inputs, outputs);
  }

  async create(userUuid: string, createChatDto: CreateChatDto, res: Response, version: string, roomId?: number) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await this.secretChatMethod.generateStream(createChatDto);

    try {
      const botMessage = { role: 'assistant', content: '' };
      let fullBotResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          botMessage.content = content;
          fullBotResponse += content;
          res.write(`data: ${JSON.stringify(botMessage)}\n\n`);
        }
      }

      if (version === 'v2') {
        await this.saveChatToDatasetV2(userUuid, createChatDto.messages, fullBotResponse, roomId);
      } else {
        await this.saveChatToDataset(userUuid, createChatDto.messages, fullBotResponse);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: 'Error fetching response' })}\n\n`);
      res.end();
    }
  }
  

  async getMessages(roomId: number): Promise<RetMessageDtos> {
    try {
      const messages = await this.prismaService.message.findMany({
        where: {
          roomId: roomId
        },
        orderBy: {
          createdAt: 'asc'
        },
        select: {
          messageId: true,
          isUser: true,
          encryptedContent: true,
          createdAt: true
        }
      });

      const messageDtos = messages.map((msg) => {
        const decryptedContent = decrypt(msg.encryptedContent);

        return { messageId: msg.messageId, isUser: msg.isUser, content: decryptedContent, createdAt: msg.createdAt } as RetMessageDto;
      });

      return { messages: messageDtos };

    } catch (error) {
      throw new HttpException(`메시지 조회 실패`, 500, { cause: new Error(`메시지 조회 실패 error=${error.message}`) });
    }
  }

  async createRoom(userUuid: string) {
    const uuidBuffer = stringToBuffer(userUuid);

    return this.prismaService.room.create({
      data: {
        userUuid: uuidBuffer
      }
    });
  }

  async getRooms(userUuid: string) {
    try {
      const uuidBuffer = stringToBuffer(userUuid);
      const rooms = await this.prismaService.room.findMany({
        where: {
          userUuid: uuidBuffer
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          roomId: true,
          title: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return { rooms };

    } catch (error) {
      throw new HttpException(`방 조회 실패`, 500, { cause: new Error(`방 조회 실패 error=${error.message}`) });
    }
  }

  async updateRoom(roomId: number, updateRoomDto: UpdateRoomDto) {
    try {
      return await this.prismaService.room.update({
        where: {
          roomId
        },
        data: {
          ...updateRoomDto,
          updatedAt: new Date()
        },
        select: {
          roomId: true,
          title: true,
          createdAt: true,
          updatedAt: true
        }
      });

    } catch (error) {
      throw new HttpException(`방 수정 실패`, 500, { cause: new Error(`방 수정 실패 error=${error.message}`) });
    }
  }
}
