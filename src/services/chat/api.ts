import { API_CONFIG } from '../config';
import { ChatMessage, ChatAttachment, CreatedActionItem } from './types';

interface AgentMessageResponse {
  summary: string;
  actionItems: string[];
  orderNumbers: string[];
  createdActionItems: CreatedActionItem[];
  notificationId: string | null;
}

export const sendMessageApi = async (
  content: string,
  attachments?: ChatAttachment[],
  token?: string,
  tenantId?: string
): Promise<ChatMessage> => {
  const formData = new FormData();
  formData.append('Message', content);

  // Add attachments if any
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      // For React Native, we need to create a file object
      const file = {
        uri: attachment.uri,
        type: attachment.type === 'image' ? 'image/jpeg' : 'application/pdf',
        name: attachment.name,
      } as any;
      
      formData.append('Attachments', file);
    }
  }

  const url = `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}/agent/messages`;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (tenantId) {
    headers['tenant-id'] = tenantId;
  }

  console.log('Sending message to agent:', content);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  console.log('Agent API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Agent API error:', errorText);
    throw new Error(`Failed to send message: ${response.status} ${errorText}`);
  }

  const responseText = await response.text();
  console.log('Agent API raw response:', responseText);

  let data: AgentMessageResponse;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse response:', e);
    throw new Error('Invalid response from agent');
  }

  console.log('Agent response parsed:', JSON.stringify(data, null, 2));

  return {
    id: Date.now().toString(),
    content: data.summary,
    sender: 'assistant',
    timestamp: new Date(),
    summary: data.summary,
    actionItems: data.actionItems,
    orderNumbers: data.orderNumbers,
    createdActionItems: data.createdActionItems,
    notificationId: data.notificationId,
  };
};
