import React, { useContext, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Animated, ScrollView } from 'react-native';
import { Card, Title, IconButton, Text, useTheme, Surface, ProgressBar, Badge } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContext } from '../context/AppContext';
import i18n from '../i18n/i18n';
import lessonsData from '../../assets/data/lessons.json';
import { Lesson } from '../types/LessonTypes';
import { spacing, shadows, animations } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonList'>;

const typedLessonsData = lessonsData as Lesson[];

const AnimatedCard = Animated.createAnimatedComponent(Card);

const ListItem = React.memo(({ 
  item, 
  index, 
  language, 
  isCompleted, 
  onPress 
}: { 
  item: Lesson; 
  index: number; 
  language: string;
  isCompleted: boolean;
  onPress: () => void;
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
        delay: index * 100,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        delay: index * 100,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedCard
      style={[
        styles.card,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      onPress={onPress}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.titleContainer}>
          <Text variant="titleLarge" style={styles.lessonTitle}>
            {item.title[language as 'en' | 'ja']}
          </Text>
          {isCompleted && (
            <IconButton
              icon="check-circle"
              size={24}
              iconColor="#4CAF50"
              style={styles.completedIcon}
            />
          )}
        </View>
        <View style={styles.statsContainer}>
          <Text variant="bodyMedium" style={styles.statsText}>
            {item.phrases.length} {i18n.t('phrases')}
          </Text>
          <Text variant="bodyMedium" style={[styles.statsText, styles.bulletPoint]}>
            •
          </Text>
          <Text variant="bodyMedium" style={styles.statsText}>
            {item.quizzes.length} {i18n.t('quizzes')}
          </Text>
        </View>
      </Card.Content>
    </AnimatedCard>
  );
});

const getBadgeInfo = (completedCount: number) => {
  if (completedCount >= 10) return { icon: 'star', color: '#FFD700', label: '達人' };
  if (completedCount >= 5) return { icon: 'medal', color: '#C0C0C0', label: '上級者' };
  if (completedCount >= 3) return { icon: 'school', color: '#CD7F32', label: '学習者' };
  return { icon: 'seed', color: '#4CAF50', label: '初心者' };
};

export default function LessonListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { language, completedLessons } = useContext(AppContext);
  const progress = completedLessons.length / typedLessonsData.length;
  const badgeInfo = getBadgeInfo(completedLessons.length);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            {i18n.t('lessons')}
          </Text>
          <Surface style={[styles.badgeContainer, { backgroundColor: badgeInfo.color }]}>
            <IconButton
              icon={badgeInfo.icon}
              iconColor="#FFF"
              size={24}
            />
            <Text style={styles.badgeLabel}>{badgeInfo.label}</Text>
          </Surface>
        </View>
        <View style={styles.progressContainer}>
          <Text variant="bodyLarge" style={styles.progressText}>
            {completedLessons.length} / {typedLessonsData.length}
          </Text>
          <Text variant="bodyMedium" style={styles.progressLabel}>
            {i18n.t('completed')}
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </Surface>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {typedLessonsData.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id);
          return (
            <Surface
              key={lesson.id}
              style={[
                styles.card,
                isCompleted && styles.completedCard,
                isCompleted && { borderLeftColor: theme.colors.primary }
              ]}
            >
              <View
                style={styles.cardContent}
                onTouchEnd={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
              >
                <View style={styles.titleContainer}>
                  <Text variant="titleLarge" style={styles.lessonTitle}>
                    {lesson.title[language as 'en' | 'ja']}
                  </Text>
                  {isCompleted && (
                    <IconButton
                      icon="check-circle"
                      iconColor={theme.colors.primary}
                      size={24}
                      style={styles.completedIcon}
                    />
                  )}
                </View>
                <View style={styles.statsContainer}>
                  <Text variant="bodyMedium" style={styles.statsText}>
                    {lesson.phrases.length} {i18n.t('phrases')}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.statsText, styles.bulletPoint]}>
                    •
                  </Text>
                  <Text variant="bodyMedium" style={styles.statsText}>
                    {lesson.quizzes.length} {i18n.t('quizzes')}
                  </Text>
                </View>
              </View>
            </Surface>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    ...shadows.small,
  },
  headerTitle: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
  },
  badgeLabel: {
    color: '#FFF',
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  progressLabel: {
    opacity: 0.7,
  },
  scrollView: {
    padding: spacing.md,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: 16,
    ...shadows.medium,
  },
  cardContent: {
    padding: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonTitle: {
    flex: 1,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statsText: {
    opacity: 0.7,
  },
  bulletPoint: {
    marginHorizontal: spacing.xs,
  },
  completedIcon: {
    margin: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: spacing.sm,
  },
  completedCard: {
    borderLeftWidth: 4,
  },
}); 