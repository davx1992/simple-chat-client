import { Socket, io } from 'socket.io-client';
import {
  Config,
  Message,
  ChatTypes,
  ConnectionStatus,
  AppError,
} from './types/chat.types';

export {
  Config,
  Message,
  ChatTypes,
  ConnectionStatus,
  AppError,
} from './types/chat.types';

import { EventEmitter } from 'events';

class SimpleChat extends EventEmitter {
  private socket: Socket | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private config: Config;

  constructor(config: Config) {
    super();
    this.config = config;
  }

  /**
   * Start client and connection
   */
  start = (): void => {
    const {
      host,
      port,
      userId,
      accessToken,
      maxReconnectAttempts,
    } = this.config;
    const url = `${host}:${port}`;
    this.socket = io(url, {
      auth: {
        userId,
        token: accessToken,
      },
      reconnectionAttempts: maxReconnectAttempts,
      transports: ['websocket'],
    });

    this.socket.on('connect', this.onConnect);
    this.socket.on('disconnect', this.onDisconnect);
    this.socket.on('message', this.onMessage);
    this.socket.io.on('connect_error', this.onConnectError);
    this.socket.io.on('reconnect', this.onReconnect);
    this.socket.io.on('reconnect_attempt', this.onReconnectAttempt);
    this.socket.io.on('reconnect_error', this.onReconnectError);
    this.socket.io.on('reconnect_failed', this.onReconnectFailed);
    this.socket.io.on('error', this.onError);
  };

  /**
   * Manually disconnect socket
   */
  disconnect = (): void => {
    this.socket?.disconnect();
  };

  /**
   * Triggered on client connected to server
   */
  onConnect = (): void => {
    this.status = ConnectionStatus.CONNECTED;
    this.emit('connected');
  };

  /**
   * Triggered on client disconnect from server
   */
  onDisconnect = (): void => {
    this.status = ConnectionStatus.DISCONNECTED;
    this.emit('disconnected');
  };

  /**
   * Fired when an namespace middleware error occurs.
   *
   * @param error
   */
  onConnectError = (error: Error): void => {
    this.status = ConnectionStatus.DISCONNECTED;
    this.emit('error', error);
  };

  /**
   * Will be triggered when error received
   *
   * @param error error object from socket
   */
  onError = (error: Error): void => {
    this.status = ConnectionStatus.DISCONNECTED;
    this.emit('error', error);
  };

  /**
   * Will be triggered after reconnect
   *
   * @param attempt reconnection attampt number
   */
  onReconnect = (attempt: number): void => {
    this.emit('reconnect', attempt);
  };

  /**
   * Will be triggered before reconnect
   *
   * @param attempt reconnection attampt number
   */
  onReconnectAttempt = (attempt: number): void => {
    this.emit('reconnect_attempt', attempt);
  };

  /**
   * Fired upon a reconnection attempt error.
   *
   * @param error Error of reconnection attempt
   */
  onReconnectError = (error: Error): void => {
    this.emit('reconnect_error', error);
  };

  /**
   * Will be fired when reconnection attempts exceeded (by default no limit for reconnections)
   */
  onReconnectFailed = (): void => {
    this.emit('reconnect_failed');
  };

  /**
   * Will be triggered when message received from server
   * When app received message it needs to be acknowledged
   * otherwise it will be moved to offline message queue
   *
   * @param message message object received from server
   */
  onMessage = (message: Message, ack: () => void): void => {
    this.emit('message', message, ack);
  };

  /**
   * Send message to chat users. Possible messages are text message and typing
   * User can send typing event without message body or with message body
   *
   * @example
   * id?: string;
   * to: string;
   * timestamp: number;
   * body?: MessageBody;
   * typing?: boolean;
   *
   * @param message message object
   */
  sendMessage = async (message: Message): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      this.socket?.emit(
        'message',
        message,
        (messageId?: string, error?: AppError) => {
          if (error) {
            return reject(error);
          }
          if (messageId) {
            resolve(messageId);
          }
        }
      );
    });
  };

  /**
   * Load message archive for chat. If no @param after provided then latest messages will be returned,
   * if param provided then messages after specific id will be returned
   *
   * @param chatId chat id for which to load archive
   * @param limit count of messages to return
   * @param after message id after which to load messages @optional
   */
  loadArchive = (
    chatId: string,
    limit: number,
    after: string | null = null
  ): Promise<Message[]> => {
    return new Promise<Message[]>((resolve, reject) => {
      this.socket?.emit(
        'load_archive',
        chatId,
        limit,
        after,
        (messages?: Message[], error?: AppError) => {
          if (error) {
            return reject(error);
          }
          if (messages) {
            resolve(messages);
          }
        }
      );
    });
  };

  /**
   * Join chat permanently or temporary. Temporary means that on disconnect chat join will be removed.
   *
   * @param chatId chat id to which join user
   * @param temp flag which indicates wether join is temporary
   */
  joinChat = async (chatId: string, temp = false): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      this.socket?.emit(
        'join_chat',
        chatId,
        temp,
        (success: boolean, error?: AppError) => {
          if (error) {
            return reject(error);
          }

          if (success) {
            resolve(success);
          }
        }
      );
    });
  };

  /**
   * Leave chat, when user left chat he will not receive any notifications and messages
   *
   * @param chatId chat id which to leave
   */
  leaveChat = async (chatId: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      this.socket?.emit(
        'leave_chat',
        chatId,
        (success: boolean, error?: AppError) => {
          if (error) {
            return reject(error);
          }

          if (success) {
            resolve(success);
          }
        }
      );
    });
  };

  /**
   * Create chat which will be used in communication. Possibe types of chat are Multi User chat, and Single User chat
   * For single user chat it is needed to provide list of two users who will be participant of the chat
   *
   * @param type type of the chat. @MUC or @SUC
   * @param users list of users for @SUC, should be only two users
   */
  createChat = async (type: ChatTypes, users: string[]): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (users.length > 2) {
        reject(
          'In user list should be only two users, and type of chat should be SUC.'
        );
      }

      this.socket?.emit(
        'create_chat',
        type,
        users,
        (chatId?: string, error?: AppError) => {
          if (error) {
            return reject(error);
          }
          if (chatId) {
            resolve(chatId);
          }
        }
      );
    });
  };
}

export default SimpleChat;
