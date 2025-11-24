import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

const EMOJI_CATEGORIES = [
  {
    title: 'Most popular',
    data: ['😂', '😮', '😍', '😢', '👏', '🔥', '🎉', '💯', '❤️', '🤣', '🥰', '😘', '😭', '😊']
  },
  {
    title: 'Activities',
    data: ['🕴️', '🧗', '🧗‍♂️', '🧗‍♀️', '🏇', '⛷️', '🏂', '🏌️', '🏌️‍♂️', '🏌️‍♀️', '🏄', '🏄‍♂️', '🏄‍♀️', '🚣', '🚣‍♂️', '🚣‍♀️', '🏊', '🏊‍♂️', '🏊‍♀️', '⛹️', '⛹️‍♂️', '⛹️‍♀️', '🏋️', '🏋️‍♂️', '🏋️‍♀️', '🚴', '🚴‍♂️', '🚴‍♀️']
  },
  {
    title: 'Smileys & People',
    data: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', 'unamused', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖']
  }
];

const { width } = Dimensions.get('window');
const EMOJI_SIZE = 40;
const NUM_COLUMNS = Math.floor((width - spacing.md * 2) / EMOJI_SIZE);

const EmojiPicker = ({ onSelect }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background.card, borderTopColor: theme.background.tertiary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {EMOJI_CATEGORIES.map((category, index) => (
          <View key={index} style={styles.category}>
            <Text style={[styles.categoryTitle, { color: theme.text.secondary }]}>{category.title}</Text>
            <View style={styles.grid}>
              {category.data.map((emoji, emojiIndex) => (
                <TouchableOpacity
                  key={emojiIndex}
                  style={styles.emojiButton}
                  onPress={() => onSelect(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderTopWidth: 1,
  },
  category: {
    padding: spacing.md,
  },
  categoryTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiButton: {
    width: EMOJI_SIZE,
    height: EMOJI_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});

export default EmojiPicker;
