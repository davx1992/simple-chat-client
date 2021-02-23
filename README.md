# Simple-Chat-Client

Simple-Chat-Client is an entity that connects to an [Simple-Chat server](https://github.com/davx1992/simple-chat).

simple-chat-client package includes set of features to connect and authenticate securely and reliably.

It supports Node.js, browsers and React Native. See below for differences.
In connection WebSockets are used. Library is using Socket.Io.

## Installation

Use npm or yarn to install the package

```bash
npm i --save simple-chat-client
yarn add simple-chat-client
```

## Example usage

```js
import SimpleChatClient from 'simple-chat-client';

const chatClient = new SimpleChatClient({
        host: 'http://localhost',
        port: 3333,
        userId: 'user_id',
        accessToken: 'access_token',
      });

chatClient.start();

chatClient.on("error", (err) => {
  console.log(err.message);
});

chatClient.on('message', (chatMessage: Message, ack: () => void) => {
    ack(); //Need to acknowledge that message received
    ...
    });
  });

const message = {
  to: 'chat_id',
  body: {
    text: 'test',
  },
  timestamp: 123123123123,
};

chatClient?.sendMessage(message)

```

## Params

Following parameters are exposed in Object instance:

### `status: ConnectionStatus`

```typescript
enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}
```

## API Reference

The following methods are exported by the simple-chat-client module:

---

### `start(): void`

Create a connection with the server. This should be called on a created object instance.
This could be called also before message listeners added.

---

### `disconnect(): void`

Disconnect from the server.

---

### `sendMessage: (message: Message) => Promise<string>`

Send messages to chat users. Possible messages are text messages and typing.
Users can send typing events without message body or with the message body.

#### Returns:

_message-id_ saved on the server.

```typescript
interface Message {
  id?: string;
  to: string;
  timestamp: number;
  body?: {
    [key: string]: any;
  };
  typing?: boolean;
  from?: string;
}
```

---

### `loadArchive: (chatId: string, limit: number, after?: string | null) => Promise<Message[]>`

Load chat message archive from a server. To load the latest messages, after should be empty. If it is needed to load messages after a specific message, **after** should be provided.

> **Note:** if **after** is not provided last messages will be provided.

#### Params:

- **chatId (_string_)** -- chat id from which to fetch messages
- **limit (_number_)** -- how many messages to fetch
- **after (_string_) (optional)** -- chat id from which to fetch messages.

#### Returns:

_Message_ list.

---

### `joinChat: (chatId: string, temp?: boolean) => Promise<boolean>`

Join chat permanently or temporarily. Temporary means that on disconnect chat join will be removed.

> **Note:** if **temp** provided as _true_ then the user will be joined temporary, and on disconnection will be automatically removed from chat.

> **Note:** if **temp** provided as _true_ then system should manually leave chat when the user navigates out of the chat.

#### Params:

- **chatId (_string_)** -- chat id to which join
- **temp (_boolean_)** (optional)-- flag to join chat temporary

#### Returns:

_boolean_ if successfully joined or not.

---

### `leaveChat: (chatId: string) => Promise<boolean>`

Leave chat. When user left chat he will not receive any notifications and messages

#### Params:

- **chatId (_string_)** -- chat id which to leave

#### Returns:

_boolean_ if successfully left or not.

---

### `createChat: (type: ChatTypes, users: string[]) => Promise<string>`

Create chat which will be used in communication. Possible types of the chat are Multi-User chat, and Single User chat For single-user chat it is needed to provide a list of two users who will be participants in the chat.

#### Params:

- **type (_ChatTypes_)** -- type of the chat.
- **users (_string[]_)** (optional) -- user list for SUC chat. Should contain only two user ids.

```typescript
enum ChatTypes {
  SUC = '@suc',
  MUC = '@muc',
}
```

#### Returns:

_string_ id of the newly created chat.

---

## Available events

Below events are available to listen:

### Event `connected`

```typescript
chatClient.on('connected', () => {
  console.debug();
});
```

### Event `disconnected`

```typescript
chatClient.on('disconnected', () => {
  console.debug();
});
```

### Event `error`

```typescript
chatClient.on('error', (error: Error) => {
  console.log(error.message);
});
```

### Event `reconnect`

```typescript
chatClient.on('reconnect', (attempt: number) => {
  console.log(attempt);
});
```

### Event `reconnect_attempt`

```typescript
chatClient.on('reconnect_attempt', (attempt: number) => {
  console.debug();
});
```

### Event `reconnect_error`

```typescript
chatClient.on('reconnect_error', (error: Error) => {
  console.log(error.message);
});
```

### Event `reconnect_failed`

```typescript
chatClient.on('reconnect_failed', () => {
  console.log(error.message);
});
```

### Event `message`

```typescript
chatClient.on("message", (chatMessage: Message, ack: () => void) => {
    ack(); //Need to acknowledge that message received
    ...
    });
  });
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
