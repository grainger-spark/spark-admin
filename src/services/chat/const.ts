import { ChatMessage, ChatState } from './types';

export const initialChatMessage: ChatMessage = {
  id: '',
  content: '',
  sender: 'user',
  timestamp: new Date(),
};

export const initialChatState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};
