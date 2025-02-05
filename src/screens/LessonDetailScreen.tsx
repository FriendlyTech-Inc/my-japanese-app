import React, { useContext } from 'react';
import { View, ScrollView, StyleSheet, Animated } from 'react-native';
import { Button, Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContext } from '../context/AppContext';
import i18n from '../i18n/i18n';
import lessonsData from '../../assets/data/lessons.json';
import { Lesson } from '../types/LessonTypes';
import { spacing, shadows, animations } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonDetail'>;

const typedLessonsData = lessonsData as Lesson[];

const AnimatedSurface = Animated.createAnimatedComponent(Surface);

export default function LessonDetailScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const theme = useTheme();
  const { language, completedLessons } = useContext(AppContext);
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [slideAnim] = React.useState(new Animated.Value(50));
  
  const lesson = typedLessonsData.find(l => l.id === lessonId);
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  if (!lesson) {
    return null;
  }

  const isCompleted = completedLessons.includes(lessonId);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header}>
        <View style={styles.titleContainer}>
          <Text variant="headlineLarge" style={styles.title}>
            {lesson.title[language as 'en' | 'ja']}
          </Text>
          {isCompleted && (
            <IconButton
              icon="check-circle"
              size={24}
              iconColor="#4CAF50"
            />
          )}
        </View>
        <View style={styles.statsContainer}>
          <Text variant="bodyLarge" style={styles.statsText}>
            {lesson.phrases.length} {i18n.t('phrases')}
          </Text>
          <Text variant="bodyLarge" style={[styles.statsText, styles.bulletPoint]}>
            •
          </Text>
          <Text variant="bodyLarge" style={styles.statsText}>
            {lesson.quizzes.length} {i18n.t('quizzes')}
          </Text>
        </View>
      </Surface>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>
          {i18n.t('phrases')}
        </Text>
        <View style={styles.phrasesContainer}>
          {lesson.phrases.map((phrase, index) => (
            <AnimatedSurface
              key={index}
              style={[
                styles.phraseCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: Animated.multiply(
                      slideAnim,
                      new Animated.Value((index + 1) * 0.5)
                    ),
                  }],
                },
              ]}
            >
              <View style={styles.phraseContent}>
                <Text variant="titleMedium" style={styles.japanese}>
                  {phrase.ja}
                </Text>
                <Text variant="bodyLarge" style={styles.english}>
                  {phrase.en}
                </Text>
              </View>
            </AnimatedSurface>
          ))}
        </View>
      </ScrollView>

      <Surface style={styles.footer}>
        <Button
          mode="contained"
          style={styles.quizButton}
          contentStyle={styles.quizButtonContent}
          labelStyle={styles.quizButtonLabel}
          onPress={() => navigation.navigate('Quiz', { lessonId })}
        >
          {i18n.t('start_quiz')}
        </Button>
      </Surface>
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  phrasesContainer: {
    marginBottom: spacing.xl,
  },
  phraseCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    ...shadows.small,
  },
  phraseContent: {
    padding: spacing.lg,
  },
  japanese: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  english: {
    opacity: 0.7,
  },
  footer: {
    padding: spacing.lg,
    ...shadows.large,
  },
  quizButton: {
    borderRadius: 12,
  },
  quizButtonContent: {
    height: 56,
  },
  quizButtonLabel: {
    fontSize: 18,
    letterSpacing: 1,
    fontWeight: '600',
  },
}); 