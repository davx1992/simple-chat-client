export interface Config {
  host: string;
  port: number;
  userId: string;
  accessToken: string;
  maxReconnectAttempts?: number;
}

export interface Message {
  id?: string;
  to: string;
  timestamp: number;
  body?: {
    [key: string]: any;
  };
  typing?: boolean;
  from?: string;
}

export interface ValidationError {
  field: string;
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
