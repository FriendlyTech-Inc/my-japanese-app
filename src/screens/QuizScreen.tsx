import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card, Button, ProgressBar, Text, Badge, useTheme, Surface } from 'react-native-paper';
import { Audio } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContext } from '../context/AppContext';
import i18n from '../i18n/i18n';
import lessonsData from '../../assets/data/lessons.json';
import { Lesson, Quiz, MultipleChoiceQuestion } from '../types/LessonTypes';
import RecordButton from '../components/RecordButton';
import { evaluatePronunciationV2, EnhancedPronResult } from '../utils/api';
import { spacing, shadows, animations } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedSurface = Animated.createAnimatedComponent(Surface);

export default function QuizScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { lessonId } = route.params;
  const { language, markLessonComplete } = useContext(AppContext);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [speakingResult, setSpeakingResult] = useState<EnhancedPronResult | null>(null);
  const [showQuizComplete, setShowQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState<Array<{
    isCorrect?: boolean;
    speakingScore?: EnhancedPronResult;
  }>>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  const lesson = lessonsData.find(l => l.id === lessonId) as Lesson;
  if (!lesson) return null;

  const currentQuiz = lesson.quizzes[currentQuizIndex];
  const isLastQuiz = currentQuizIndex === lesson.quizzes.length - 1;

  useEffect(() => {
    if (showQuizComplete) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentQuizIndex, showQuizComplete]);

  const handleAnswer = (index: number) => {
    if (!currentQuiz || currentQuiz.type !== 'multiple-choice') return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    const isCorrect = index === currentQuiz.correctIndex;
    const newResults = [...quizResults];
    newResults[currentQuizIndex] = { isCorrect };
    setQuizResults(newResults);
  };

  const handleRecordingComplete = async (audioUri: string) => {
    if (currentQuiz.type === 'speaking') {
      const result = await evaluatePronunciationV2(audioUri, currentQuiz.answer.ja);
      setSpeakingResult(result);
      setShowResult(true);
      const newResults = [...quizResults];
      newResults[currentQuizIndex] = { speakingScore: result };
      setQuizResults(newResults);
    }
  };

  const handleNext = () => {
    if (isLastQuiz) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        markLessonComplete(lessonId);
        setShowQuizComplete(true);
      });
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setSpeakingResult(null);
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
      });
    }
  };

  const renderMultipleChoice = (quiz: MultipleChoiceQuestion) => (
    <View style={styles.quizContentWrapper}>
      <AnimatedSurface
        style={[
          styles.quizContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.questionSurfaceWrapper}>
          <Surface style={styles.questionSurface}>
            <Text variant="headlineLarge" style={styles.questionText}>
              {quiz.question[language as 'en' | 'ja']}
            </Text>
          </Surface>
        </View>
        <View style={styles.optionsContainer}>
          {quiz.options.map((option, index) => (
            <Animated.View
              key={index}
              style={[
                styles.optionWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: Animated.multiply(
                      slideAnim,
                      new Animated.Value((index + 1) * 0.3)
                    ),
                  }],
                },
              ]}
            >
              <Button
                mode={selectedAnswer === index ? 'contained' : 'outlined'}
                style={[
                  styles.option,
                  showResult && index === quiz.correctIndex && styles.correctOption,
                  showResult && selectedAnswer === index && index !== quiz.correctIndex && styles.wrongOption,
                ]}
                labelStyle={[
                  styles.optionLabel,
                  showResult && (index === quiz.correctIndex || (selectedAnswer === index && index !== quiz.correctIndex)) && styles.optionLabelLight,
                ]}
                disabled={showResult}
                onPress={() => handleAnswer(index)}
                contentStyle={styles.optionContent}
              >
                {option[language as 'en' | 'ja']}
              </Button>
            </Animated.View>
          ))}
        </View>
      </AnimatedSurface>
    </View>
  );

  const renderSpeakingQuiz = () => (
    <AnimatedSurface
      style={[
        styles.quizContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Surface style={styles.questionSurface}>
        <Text variant="headlineLarge" style={styles.questionText}>
          {currentQuiz.type === 'speaking' && currentQuiz.prompt[language as 'en' | 'ja']}
        </Text>
      </Surface>
      {!showResult ? (
        <View style={styles.speakingContainer}>
          <RecordButton onRecordFinish={handleRecordingComplete} />
        </View>
      ) : (
        <Surface style={styles.feedbackSection}>
          {speakingResult && (
            <>
              <Text variant="bodyLarge" style={styles.feedbackComment}>
                {speakingResult.comment}
              </Text>
              <View style={styles.scoreRow}>
                <Text variant="bodyMedium" style={styles.scoreLabel}>
                  Accuracy
                </Text>
                <View style={styles.scoreBarContainer}>
                  <ProgressBar
                    progress={speakingResult.accuracy / 100}
                    style={styles.progressBar}
                    color={getProgressColor(speakingResult.accuracy)}
                  />
                  <Badge size={32} style={[styles.scoreBadge, { backgroundColor: getProgressColor(speakingResult.accuracy) }]}>
                    {Math.round(speakingResult.accuracy)}
                  </Badge>
                </View>
              </View>
              <View style={styles.scoreRow}>
                <Text variant="bodyMedium" style={styles.scoreLabel}>
                  Fluency
                </Text>
                <View style={styles.scoreBarContainer}>
                  <ProgressBar
                    progress={speakingResult.fluency / 100}
                    style={styles.progressBar}
                    color={getProgressColor(speakingResult.fluency)}
                  />
                  <Badge size={32} style={[styles.scoreBadge, { backgroundColor: getProgressColor(speakingResult.fluency) }]}>
                    {Math.round(speakingResult.fluency)}
                  </Badge>
                </View>
              </View>
              <View style={styles.scoreRow}>
                <Text variant="bodyMedium" style={styles.scoreLabel}>
                  Overall
                </Text>
                <View style={styles.scoreBarContainer}>
                  <ProgressBar
                    progress={speakingResult.overall / 100}
                    style={styles.progressBar}
                    color={getProgressColor(speakingResult.overall)}
                  />
                  <Badge size={32} style={[styles.scoreBadge, { backgroundColor: getProgressColor(speakingResult.overall) }]}>
                    {Math.round(speakingResult.overall)}
                  </Badge>
                </View>
              </View>
            </>
          )}
        </Surface>
      )}
    </AnimatedSurface>
  );

  const renderQuizComplete = () => {
    const results = lesson.quizzes.map((quiz, index) => {
      const result = quizResults[index];
      if (quiz.type === 'multiple-choice') {
        return {
          type: 'multiple-choice' as const,
          isCorrect: result?.isCorrect ?? false,
        };
      }
      return {
        type: 'speaking' as const,
        score: result?.speakingScore?.overall ?? 0,
        isGood: (result?.speakingScore?.overall ?? 0) >= 70,
      };
    });

    const correctAnswers = results.reduce((count, result) => {
      if (result.type === 'multiple-choice') {
        return count + (result.isCorrect ? 1 : 0);
      }
      return count + (result.isGood ? 1 : 0);
    }, 0);

    const multipleChoiceResults = results.filter(r => r.type === 'multiple-choice');
    const speakingResults = results.filter(r => r.type === 'speaking');
    const multipleChoiceCorrect = multipleChoiceResults.filter(r => r.type === 'multiple-choice' && r.isCorrect).length;
    const speakingGood = speakingResults.filter(r => r.type === 'speaking' && r.isGood).length;

    return (
      <Animated.View
        style={[
          styles.completeContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Surface style={styles.completeContent}>
          <Text variant="headlineLarge" style={styles.completeTitle}>
            {i18n.t('lesson_complete')}
          </Text>
          <Text variant="titleLarge" style={styles.scoreText}>
            {i18n.t('your_score')}: {correctAnswers} / {lesson.quizzes.length}
          </Text>
          
          {multipleChoiceResults.length > 0 && (
            <View style={styles.resultSection}>
              <Text variant="titleMedium" style={styles.resultSectionTitle}>
                {i18n.t('multiple_choice_result')}
              </Text>
              <Text variant="bodyLarge" style={styles.resultDetail}>
                {multipleChoiceCorrect} / {multipleChoiceResults.length}
              </Text>
            </View>
          )}
          
          {speakingResults.length > 0 && (
            <View style={styles.resultSection}>
              <Text variant="titleMedium" style={styles.resultSectionTitle}>
                {i18n.t('speaking_result')}
              </Text>
              <Text variant="bodyLarge" style={styles.resultDetail}>
                {speakingGood} / {speakingResults.length}
              </Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.completeButton}
            contentStyle={styles.completeButtonContent}
          >
            {i18n.t('back_to_lesson')}
          </Button>
        </Surface>
      </Animated.View>
    );
  };

  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.colors.background,
  };

  const surfaceStyle = {
    backgroundColor: theme.colors.surface,
  };

  return (
    <View style={containerStyle}>
      {showQuizComplete ? (
        renderQuizComplete()
      ) : (
        <>
          <Surface style={[styles.header, surfaceStyle]}>
            <Text variant="titleLarge" style={styles.lessonTitle}>
              {lesson.title[language as 'en' | 'ja']}
            </Text>
            <Badge size={24} style={styles.progressBadge}>
              {`${currentQuizIndex + 1} / ${lesson.quizzes.length}`}
            </Badge>
          </Surface>
          <View style={styles.content}>
            {currentQuiz.type === 'multiple-choice'
              ? renderMultipleChoice(currentQuiz as MultipleChoiceQuestion)
              : renderSpeakingQuiz()}
          </View>
          {showResult && (
            <Surface style={[styles.footer, surfaceStyle]}>
              <Button
                mode="contained"
                onPress={handleNext}
                style={styles.nextButton}
                contentStyle={styles.nextButtonContent}
                labelStyle={styles.nextButtonLabel}
              >
                {isLastQuiz ? i18n.t('finish') : i18n.t('next')}
              </Button>
            </Surface>
          )}
        </>
      )}
    </View>
  );
}

const getProgressColor = (score: number) => {
  if (score >= 90) return '#4CAF50';
  if (score >= 70) return '#2196F3';
  if (score >= 50) return '#FFC107';
  return '#FF5252';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...shadows.medium,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    marginRight: 12,
  },
  progressBadge: {
    backgroundColor: '#7C4DFF',
    minWidth: 44,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  quizContentWrapper: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 20,
    ...shadows.medium,
  },
  quizContent: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 20,
  },
  questionSurfaceWrapper: {
    width: '100%',
    ...shadows.medium,
  },
  questionSurface: {
    width: '100%',
    padding: 24,
    backgroundColor: '#7C4DFF',
    borderRadius: 20,
  },
  questionText: {
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 32,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  optionWrapper: {
    marginBottom: 12,
  },
  option: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  optionContent: {
    minHeight: 56,
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionLabelLight: {
    color: '#FFFFFF',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: '#FF5252',
    borderColor: '#FF5252',
  },
  speakingContainer: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  feedbackSection: {
    width: '100%',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  feedbackComment: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 24,
    color: '#7C4DFF',
    fontWeight: '500',
  },
  scoreRow: {
    marginBottom: 16,
  },
  scoreLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  scoreBadge: {
    marginLeft: 16,
    width: 44,
    height: 44,
  },
  footer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    ...shadows.large,
  },
  nextButton: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#7C4DFF',
  },
  nextButtonContent: {
    minHeight: 56,
  },
  nextButtonLabel: {
    fontSize: 17,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  completeContent: {
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    ...shadows.large,
  },
  completeTitle: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#7C4DFF',
    marginBottom: 24,
  },
  scoreText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 32,
  },
  resultSection: {
    width: '100%',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 77, 255, 0.08)',
  },
  resultSectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#7C4DFF',
  },
  resultDetail: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#7C4DFF',
  },
  completeButton: {
    width: '100%',
    borderRadius: 16,
    marginTop: 32,
    backgroundColor: '#7C4DFF',
  },
  completeButtonContent: {
    minHeight: 56,
  },
}); 