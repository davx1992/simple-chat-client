export type Config = {
  host: string;
  port: number;
  userId: string;
  accessToken: string;
  maxReconnectAttempts?: number;
};

export type Message = {
  id?: string;
  to: string;
  timestamp: number;
  body?: {
    [key: string]: any;
  };
  typing?: boolean;
  from?: string;
};

export interface AppError {
  code: number;
  error: string;
}

export enum ChatTypes {
  SUC = '@suc',
  MUC = '@muc',
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}
