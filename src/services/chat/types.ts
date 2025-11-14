export interface ChatAttachment {
  id: string;
  type: 'file' | 'image';
  uri: string;
  name: string;
  size?: number;
}

export interface CreatedActionItem {
  id: string;
  actionType: string;
  data: Record<string, any>;
  isCompleted: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  attachments?: ChatAttachment[];
  summary?: string;
  actionItems?: string[];
  orderNumbers?: string[];
  createdActionItems?: CreatedActionItem[];
  notificationId?: string | null;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
