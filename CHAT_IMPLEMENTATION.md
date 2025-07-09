# Chat Implementation Documentation

## Overview
This implementation provides real-time chat functionality using WebSocket connections and REST API endpoints.

## Features Implemented

### 1. Chat List Screen (`ChatListScreen.tsx`)
- Displays list of conversations
- Fetches chat list based on user role (athlete/scout)
- Navigates to chat detail when a conversation is tapped
- Passes receiver information (name, image) to chat detail screen

### 2. Chat Detail Screen (`ChatDetailScreen.tsx`)
- Real-time messaging interface
- Fetches chat history from API endpoint
- Sends and receives messages via WebSocket
- Supports text messages (file support prepared for future)
- Auto-scrolls to latest messages
- Shows online/offline status

### 3. Socket Service (`socketService.ts`)
- Manages WebSocket connection
- Handles message sending and receiving
- Automatic reconnection on connection loss
- Listens to `bad-request` and `receiver_message` events

### 4. Chat Store (`chat.ts`)
- Manages chat state using MobX
- Handles API calls for chat history
- Stores messages and conversations
- Provides methods for adding new messages

## API Endpoints Used

### Chat List
- **Athlete**: `GET /general/message/athlete/chat-list`
- **Scout**: `GET /general/message/scout/chat-list`

### Chat History
- **Athlete**: `GET /general/message/athlete/history/:receiver`
- **Scout**: `GET /general/message/scout/history/:receiver`

## WebSocket Events

### Sending Messages
```javascript
{
  event: 'send_message',
  data: {
    sender: "user_id",
    receiver: "receiver_id",
    content: "message content",
    fileUrl: "",
    fileName: "",
    fileType: "",
    messageType: "text"
  }
}
```

### Receiving Messages
- **Event**: `receiver_message`
- **Event**: `bad-request` (for errors)

## Message Types Supported
- `text` - Text messages
- `image` - Image files (prepared for future)
- `video` - Video files (prepared for future)
- `document` - Document files (prepared for future)

## Usage

### Navigating to Chat Detail
```javascript
navigation.navigate('ChatDetail', {
  chatId: 'receiver_user_id',
  receiverName: 'Receiver Name',
  receiverImage: 'https://example.com/image.jpg'
});
```

### Sending a Message
Messages are automatically sent via WebSocket when the user taps the send button. The message format follows the API specification.

### Receiving Messages
Incoming messages are automatically handled by the socket service and added to the chat store, which updates the UI in real-time.

## Configuration

### Environment Variables
The socket URL is configured in `src/config/env.ts`:
- Development: `wss://dev-socket.confluenx.com`
- Staging: `wss://staging-socket.confluenx.com`
- Production: `wss://socket.confluenx.com`

## Future Enhancements
1. File upload support (images, videos, documents)
2. Message status indicators (sent, delivered, read)
3. Typing indicators
4. Message search functionality
5. Message deletion and editing
6. Push notifications for new messages

## Error Handling
- Network errors are handled with user-friendly alerts
- Socket connection failures trigger automatic reconnection
- API errors are logged and displayed to users
- Loading states are properly managed

## Dependencies
- `react-native-websocket` for WebSocket connections
- `mobx` and `mobx-react-lite` for state management
- `lucide-react-native` for icons
- `date-fns` for date formatting 