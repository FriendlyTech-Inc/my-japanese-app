import React, { useContext, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Animated } from 'react-native';
import { Card, Title, IconButton, Text, useTheme, Surface } from 'react-native-paper';
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
              iconColor={theme.colors.success || '#4CAF50'}
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

export default function LessonListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { language, completedLessons } = useContext(AppContext);

  const renderItem = ({ item, index }: { item: Lesson; index: number }) => (
    <ListItem
      item={item}
      index={index}
      language={language}
      isCompleted={completedLessons.includes(item.id)}
      onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineLarge" style={styles.headerTitle}>
          {i18n.t('lessons')}
        </Text>
        <View style={styles.progressContainer}>
          <Text variant="bodyLarge" style={styles.progressText}>
            {completedLessons.length} / {typedLessonsData.length}
          </Text>
          <Text variant="bodyMedium" style={styles.progressLabel}>
            {i18n.t('completed')}
          </Text>
        </View>
      </Surface>
      <FlatList
        data={typedLessonsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
}); 