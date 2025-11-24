import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI } from '../services/api';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import CommentsModal from '../components/CommentsModal';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getImageUrl } from '../utils/image';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { deletePost, likePost } = usePosts();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Refresh profile when screen comes into focus (e.g., after settings update)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchProfile();
      }
    }, [user])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile(user.id);
      
      if (response.success) {
        setUserProfile(response.user);
      }

      // Fetch user's posts
      const postsResponse = await postAPI.getUserPosts(user.id);
      if (postsResponse.success) {
        setUserPosts(postsResponse.posts || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      // Remove from local state
      setUserPosts(prev => prev.filter(post => (post.id || post._id) !== postId));
      console.log('Post deleted from profile');
    } catch (error) {
      console.error('Error deleting post from profile:', error);
    }
  };

  const handleLike = async (postId) => {
    await likePost(postId);
    // Update local state
    setUserPosts(prev => prev.map(post => {
      if ((post.id || post._id) === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleComment = (postId) => {
    setSelectedPostId(postId);
    setCommentsVisible(true);
  };

  const handleShare = (postId) => {
    console.log('Share post:', postId);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const profile = userProfile || user;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={theme.primary.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Image source={{ uri: getImageUrl(profile.avatar) }} style={styles.avatar} />
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="settings-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Profile Info */}
        <View style={[styles.profileInfo, { backgroundColor: theme.background.card }]}>
          <Text style={[styles.name, { color: theme.text.primary }]}>{profile.name}</Text>
          <Text style={[styles.username, { color: theme.text.secondary }]}>@{profile.username}</Text>
          {profile.bio && <Text style={[styles.bio, { color: theme.text.primary }]}>{profile.bio}</Text>}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{userPosts.length || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Posts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.background.tertiary }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{profile.followersCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{profile.followingCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Following</Text>
            </View>
          </View>
        </View>

        {/* Posts Section */}
        <View style={[styles.postsSection, { backgroundColor: theme.background.card }]}>
          <View style={styles.postsSectionHeader}>
            <Ionicons name="grid-outline" size={24} color={theme.primary.main} />
            <Text style={[styles.postsSectionTitle, { color: theme.text.primary }]}>My Posts</Text>
          </View>

          {userPosts.length > 0 ? (
            <View>
              {userPosts.map((post) => (
                <PostCard
                  key={post.id || post._id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onDelete={handleDeletePost}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={64} color={theme.text.tertiary} />
              <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>No posts yet</Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.text.tertiary }]}>
                Share your first post and it will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <CommentsModal
        visible={commentsVisible}
        postId={selectedPostId}
        onClose={() => setCommentsVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  profileInfo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    marginTop: -spacing.xxl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  name: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'transparent', // Handled dynamically
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
  },
  postsSection: {
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  postsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  postsSectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
});

export default ProfileScreen;
