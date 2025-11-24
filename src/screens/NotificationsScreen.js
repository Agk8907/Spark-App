import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationsContext';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

import UserAvatar from '../components/UserAvatar';

const NotificationsScreen = ({ navigation }) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const { theme } = useTheme();

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate to the post or profile
    if (notification.postId) {
        // TODO: Navigate to specific post
        // navigation.navigate('PostDetails', { postId: notification.postId });
    }
  };

  const getNotificationText = (notification) => {
    const username = notification.user?.name || 'Someone';
    switch (notification.type) {
      case 'like':
        return <Text><Text style={{fontWeight: 'bold'}}>{username}</Text> liked your post.</Text>;
      case 'comment':
        return <Text><Text style={{fontWeight: 'bold'}}>{username}</Text> commented on your post.</Text>;
      case 'reply':
        return <Text><Text style={{fontWeight: 'bold'}}>{username}</Text> replied to your comment.</Text>;
      case 'like_comment':
        return <Text><Text style={{fontWeight: 'bold'}}>{username}</Text> liked your comment.</Text>;
      case 'follow':
        return <Text><Text style={{fontWeight: 'bold'}}>{username}</Text> started following you.</Text>;
      default:
        return <Text><Text style={{fontWeight: 'bold'}}>{username}</Text> interacted with you.</Text>;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
      case 'like_comment':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'reply':
        return 'chatbubble-ellipses';
      case 'follow':
        return 'person-add';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'like':
      case 'like_comment':
        return '#FF4D4D'; // Red
      case 'comment':
      case 'reply':
        return '#4D79FF'; // Blue
      case 'follow':
        return theme.primary.main;
      default:
        return theme.text.secondary;
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, { backgroundColor: theme.background.card }, !item.read && { backgroundColor: theme.background.secondary }]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationLeft}>
        <UserAvatar uri={item.user?.avatar} size="medium" />
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: getNotificationColor(item.type) },
          ]}
        >
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={12}
            color="#fff"
          />
        </View>
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.notificationText, { color: theme.text.primary }]}>
          {getNotificationText(item)}
        </Text>
        <Text style={[styles.timeText, { color: theme.text.secondary }]}>{getTimeAgo(item.timestamp)}</Text>
      </View>

      {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary.main }]} />}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={theme.primary.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={theme.text.secondary}
            />
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>No notifications yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.text.secondary }]}>
              You'll see notifications when someone interacts with your posts
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.sm,
  },
  headerGradient: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  markAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.md,
  },
  markAllText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
  },
  unread: {
    // Handled dynamically
  },
  notificationLeft: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
  timeText: {
    fontSize: typography.sizes.sm,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
