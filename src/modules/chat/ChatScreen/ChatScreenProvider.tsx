import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { sendMessageApi, ChatMessage, ChatAttachment, initialChatState } from '../../../services';
import { useAuth } from '../../../providers';

interface ChatScreenContextType {
  messages: ChatMessage[];
  inputText: string;
  attachments: ChatAttachment[];
  isLoading: boolean;
  error: string | null;
  setInputText: (text: string) => void;
  handleSend: () => Promise<void>;
  handleAttachFile: () => Promise<void>;
  handleTakeScreenshot: () => Promise<void>;
  removeAttachment: (id: string) => void;
}

const ChatScreenContext = createContext<ChatScreenContextType | undefined>(undefined);

export const useChatScreen = () => {
  const context = useContext(ChatScreenContext);
  if (!context) {
    throw new Error('useChatScreen must be used within ChatScreenProvider');
  }
  return context;
};

interface ChatScreenProviderProps {
  children: ReactNode;
}

export const ChatScreenProvider = ({ children }: ChatScreenProviderProps) => {
  const { user } = useAuth();
  const [state, setState] = useState(initialChatState);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);

  const handleSend = async () => {
    if (!inputText.trim() && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      content: 'Agent is thinking...',
      sender: 'assistant',
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, typingMessage],
      isLoading: true,
    }));

    setInputText('');
    setAttachments([]);

    try {
      const response = await sendMessageApi(inputText, attachments, user?.token, user?.tenantId);
      
      console.log('Got response from agent, updating UI');
      
      // Remove typing indicator and add real response
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages.filter(m => m.id !== 'typing'), response],
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator and show error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages.filter(m => m.id !== 'typing'), errorMessage],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
    }
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const attachment: ChatAttachment = {
          id: Date.now().toString(),
          type: 'file',
          uri: file.uri,
          name: file.name,
          size: file.size,
        };
        setAttachments((prev) => [...prev, attachment]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const handleTakeScreenshot = async () => {
    try {
      // Show action sheet to choose between camera and library
      const { ActionSheetIOS, Platform, Alert } = require('react-native');
      
      const options = ['Take Photo', 'Choose from Library', 'Cancel'];
      const cancelButtonIndex = 2;

      const showOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
            {
              options,
              cancelButtonIndex,
            },
              // @ts-ignore
            async (buttonIndex) => {
              if (buttonIndex === 0) {
                await launchCamera();
              } else if (buttonIndex === 1) {
                await launchLibrary();
              }
            }
          );
        } else {
          Alert.alert(
            'Add Photo',
            'Choose an option',
            [
              { text: 'Take Photo', onPress: launchCamera },
              { text: 'Choose from Library', onPress: launchLibrary },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }
      };

      const launchCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is needed to take photos');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const image = result.assets[0];
          const attachment: ChatAttachment = {
            id: Date.now().toString(),
            type: 'image',
            uri: image.uri,
            name: 'photo.jpg',
          };
          setAttachments((prev) => [...prev, attachment]);
        }
      };

      const launchLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Photo library permission is needed');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const image = result.assets[0];
          const attachment: ChatAttachment = {
            id: Date.now().toString(),
            type: 'image',
            uri: image.uri,
            name: 'image.jpg',
          };
          setAttachments((prev) => [...prev, attachment]);
        }
      };

      showOptions();
    } catch (error) {
      console.error('Error with image picker:', error);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  return (
    <ChatScreenContext.Provider
      value={{
        messages: state.messages,
        inputText,
        attachments,
        isLoading: state.isLoading,
        error: state.error,
        setInputText,
        handleSend,
        handleAttachFile,
        handleTakeScreenshot,
        removeAttachment,
      }}
    >
      {children}
    </ChatScreenContext.Provider>
  );
};
