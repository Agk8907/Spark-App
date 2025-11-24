import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  RefreshControl,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import PostCard from '../components/PostCard';
import CommentsModal from '../components/CommentsModal';
import { usePosts } from '../context/PostsContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

const FeedScreen = ({ navigation }) => {
  const { posts, loading, fetchPosts, likePost, deletePost } = usePosts();
  const { theme, isDark, setThemeMode } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Refresh feed when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      fetchPosts(1);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(1);
    setRefreshing(false);
  };

  const handleLike = async (postId) => {
    await likePost(postId);
  };

  const handleComment = (postId) => {
    setSelectedPostId(postId);
    setCommentsVisible(true);
  };

  const handleShare = (postId) => {
    console.log('Share post:', postId);
  };

  const handleDelete = async (postId) => {
    const result = await deletePost(postId);
    if (result.success) {
      // Post removed from state automatically by deletePost in context
      console.log('Post deleted successfully');
    } else {
      console.error('Failed to delete post:', result.error);
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'photos', label: 'Photos' },
    { key: 'text', label: 'Text' },
  ];

  const getFilteredPosts = () => {
    if (filter === 'all') return posts;
    if (filter === 'photos') return posts.filter(p => p.type === 'image');
    if (filter === 'text') return posts.filter(p => p.type === 'text');
    return posts;
  };
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
            <Text style={styles.headerTitle}>Spark</Text>
            <Text style={styles.headerSubtitle}>Crafted by Akki Gopi</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemeToggle style={{ marginRight: 12 }} />
            <TouchableOpacity
              onPress={() => navigation.navigate('CreatePost')}
              style={styles.createButton}
            >
              <Ionicons name="add-circle" size={36} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterPill,
              { backgroundColor: filter === f.key ? theme.primary.main : theme.background.tertiary },
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f.key ? '#fff' : theme.text.secondary },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: theme.text.primary }]}>✨ You're all caught up!</Text>
      <Text style={[styles.footerSubtext, { color: theme.text.secondary }]}>
        Take a break and come back later
      </Text>
    </View>
  );

  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.secondary }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      <FlatList
        data={getFilteredPosts()}
        keyExtractor={(item) => (item.id || item._id)?.toString() || String(Math.random())}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onDelete={handleDelete}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={posts.length > 0 ? renderFooter : null}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={theme.text.tertiary} />
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>No posts yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.text.secondary }]}>Be the first to create a post!</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreatePost')}
              style={styles.emptyButton}
            >
              <LinearGradient
                colors={theme.primary.gradient}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>Create Post</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary.main}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={theme.primary.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsVisible}
        postId={selectedPostId}
        onClose={() => {
          setCommentsVisible(false);
          setSelectedPostId(null);
        }}
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
    marginBottom: spacing.md,
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
    color: '#fff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: '#fff',
    opacity: 0.9,
  },
  createButton: {
    marginLeft: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    fontSize: typography.sizes.sm,
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
  },
  emptyButton: {
    marginTop: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    borderRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FeedScreen;
