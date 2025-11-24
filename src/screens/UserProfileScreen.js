import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getImageUrl } from '../utils/image';

const { width } = Dimensions.get('window');

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile(userId);

      if (response.success) {
        setUserProfile(response.user);
        setUserPosts(response.posts || []);
        setIsFollowing(response.isFollowing || false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      
      // Animate button
      Animated.sequence([
        Animated.timing(buttonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      const response = await userAPI.followUser(userId);

      if (response.success) {
        setIsFollowing(response.isFollowing);
        // Update follower count from response
        setUserProfile(prev => ({
          ...prev,
          followersCount: response.followersCount || prev.followersCount,
        }));
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
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

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={theme.text.secondary} />
          <Text style={[styles.errorText, { color: theme.text.secondary }]}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={theme.primary.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            {navigation.canGoBack() && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}

            <Image source={{ uri: getImageUrl(userProfile.avatar) }} style={styles.avatar} />
          </View>
        </LinearGradient>

        {/* Profile Info */}
        <View style={[styles.profileInfo, { backgroundColor: theme.background.card }]}>
          <Text style={[styles.name, { color: theme.text.primary }]}>{userProfile.name}</Text>
          <Text style={[styles.username, { color: theme.text.secondary }]}>@{userProfile.username}</Text>
          {userProfile.bio && <Text style={[styles.bio, { color: theme.text.primary }]}>{userProfile.bio}</Text>}

          {/* Follow Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.followButton}
              onPress={handleFollow}
              disabled={followLoading}
            >
              <LinearGradient
                colors={isFollowing ? ['#E0E0E0', '#BDBDBD'] : theme.primary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.followButtonGradient}
              >
                {followLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={isFollowing ? 'checkmark-circle' : 'person-add'}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.followButtonText}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats */}
          <View style={[styles.stats, { borderTopColor: theme.background.tertiary }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{userProfile.postsCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Posts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.background.tertiary }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{userProfile.followersCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Followers</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.background.tertiary }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{userProfile.followingCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Following</Text>
            </View>
          </View>
        </View>

        {/* Posts Grid */}
        <View style={[styles.postsSection, { backgroundColor: theme.background.card }]}>
          <View style={styles.postsSectionHeader}>
            <Ionicons name="grid-outline" size={20} color={theme.primary.main} />
            <Text style={[styles.postsSectionTitle, { color: theme.text.primary }]}>Posts</Text>
          </View>

          {userPosts.length > 0 ? (
            <View style={styles.postsGrid}>
              {userPosts.map((post) => (
                <TouchableOpacity
                  key={post._id || post.id}
                  style={styles.gridItem}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('PostDetails', { post })}
                >
                  {post.image ? (
                    <Image
                      source={{ uri: getImageUrl(post.image) }}
                      style={styles.gridImage}
                    />
                  ) : (
                    <View style={[styles.textPostPreview, { backgroundColor: theme.background.secondary }]}>
                      <Text style={[styles.textPostContent, { color: theme.text.primary }]} numberOfLines={3}>
                        {post.content}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noPostsContainer}>
              <Ionicons name="images-outline" size={64} color={theme.text.secondary} />
              <Text style={[styles.noPostsText, { color: theme.text.secondary }]}>No posts yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.lg,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
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
    textAlign: 'center',
  },
  username: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  bio: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  followButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  followButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  followButtonText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
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
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -2,
  },
  gridItem: {
    width: (width - spacing.lg * 2 - 4) / 3,
    height: (width - spacing.lg * 2 - 4) / 3,
    margin: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  textPostPreview: {
    width: '100%',
    height: '100%',
    padding: spacing.sm,
    justifyContent: 'center',
  },
  textPostContent: {
    fontSize: typography.sizes.xs,
  },
  noPostsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  noPostsText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default UserProfileScreen;
