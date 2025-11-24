import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing } from '../theme/spacing';

const CommentActions = ({ 
  likesCount, 
  isLiked, 
  onLike, 
  onReply, 
  onDelete,
  canDelete,
  timestamp,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.leftActions}>
        <Text style={[styles.timestamp, { color: theme.text.tertiary }]}>{timestamp}</Text>
        
        <TouchableOpacity onPress={onLike} style={styles.actionButton}>
          <Text style={[
            styles.actionText, 
            { color: isLiked ? theme.status.error : theme.text.secondary },
            isLiked && styles.likedText
          ]}>
            {likesCount > 0 ? `${likesCount} ` : ''}Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onReply} style={styles.actionButton}>
          <Text style={[styles.actionText, { color: theme.text.secondary }]}>Reply</Text>
        </TouchableOpacity>
      </View>

      {canDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={14} color={theme.text.tertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingRight: spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    marginRight: spacing.md,
  },
  actionButton: {
    paddingVertical: 2,
  },
  actionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  likedText: {
    fontWeight: typography.weights.bold,
  },
  deleteButton: {
    padding: 4,
  },
});

export default CommentActions;
