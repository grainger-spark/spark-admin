import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../../../services';
import { colors, spacing, typography } from '../../../../theme';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isTyping = message.id === 'typing';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        )}
        
        {!isTyping && message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((attachment) => (
              <View key={attachment.id} style={styles.attachment}>
                {attachment.type === 'image' ? (
                  <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                ) : (
                  <Text style={[styles.attachmentText, isUser && styles.userText]}>
                    📎 {attachment.name}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
        
        {!isTyping && (
          <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
            {message.content}
          </Text>
        )}

        {/* Show order numbers if present */}
        {!isTyping && !isUser && message.orderNumbers && message.orderNumbers.length > 0 && (
          <View style={styles.orderNumbersContainer}>
            {message.orderNumbers.map((orderNum, index) => (
              <View key={index} style={styles.orderNumberPill}>
                <Text style={styles.orderNumberText}>{orderNum}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Show action items if present */}
        {!isTyping && !isUser && message.actionItems && message.actionItems.length > 0 && (
          <View style={styles.actionItemsContainer}>
            <Text style={styles.actionItemsTitle}>Suggested Actions:</Text>
            {message.actionItems.map((item, index) => (
              <View key={index} style={styles.actionItemRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                <Text style={styles.actionItemText}>• {item}</Text>
              </View>
            ))}
          </View>
        )}

        {!isTyping && (
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.gray100,
    borderBottomLeftRadius: 4,
  },
  text: {
    ...typography.body,
  },
  userText: {
    color: colors.white,
  },
  assistantText: {
    color: colors.textPrimary,
  },
  timestamp: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  userTimestamp: {
    color: colors.white,
    opacity: 0.8,
  },
  assistantTimestamp: {
    color: colors.textSecondary,
  },
  attachmentsContainer: {
    marginBottom: spacing.sm,
  },
  attachment: {
    marginBottom: spacing.xs,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  attachmentText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  orderNumbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  orderNumberPill: {
    backgroundColor: colors.primary + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  orderNumberText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  actionItemsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  actionItemsTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  actionItemText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
});
