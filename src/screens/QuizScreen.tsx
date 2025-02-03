import React, { useState, useContext } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card, Button, ProgressBar, Text as PaperText, Badge, Title, useTheme, Surface } from 'react-native-paper';
import { Audio } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContext } from '../context/AppContext';
import i18n from '../i18n/i18n';
import lessonsData from '../../assets/data/lessons.json';
import { Lesson, Quiz, MultipleChoiceQuestion } from '../types/LessonTypes';
import RecordButton from '../components/RecordButton';
import { evaluatePronunciationV2 } from '../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

interface EnhancedPronResult {
  accuracy: number;
  fluency: number;
  overall: number;
  comment: string;
}

export default function QuizScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { lessonId } = route.params;
  const { language, markLessonComplete } = useContext(AppContext);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [speakingResult, setSpeakingResult] = useState<EnhancedPronResult | null>(null);
  const [recordAnim] = useState(new Animated.Value(0));

  const lesson = lessonsData.find(l => l.id === lessonId) as Lesson;
  if (!lesson) return null;

  const currentQuiz = lesson.quizzes[currentQuizIndex];
  const isLastQuiz = currentQuizIndex === lesson.quizzes.length - 1;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  const handleRecordingComplete = async (audioUri: string) => {
    if (currentQuiz.type === 'speaking') {
      const result = await evaluatePronunciationV2(audioUri, currentQuiz.answer.ja);
      setSpeakingResult(result);
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (isLastQuiz) {
      markLessonComplete(lessonId);
      navigation.goBack();
    } else {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setSpeakingResult(null);
    }
  };

  const renderMultipleChoice = (quiz: MultipleChoiceQuestion) => (
    <View style={styles.quizContent}>
      <Surface style={styles.questionSurface}>
        <Title style={styles.questionText}>
          {quiz.question[language as 'en' | 'ja']}
        </Title>
      </Surface>
      <View style={styles.optionsContainer}>
        {quiz.options.map((option, index) => (
          <Animated.View
            key={index}
            style={[
              styles.optionWrapper,
              {
                transform: [{
                  scale: showResult && (index === quiz.correctIndex || index === selectedAnswer)
                    ? 1.05
                    : 1
                }]
              }
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
                showResult && (index === quiz.correctIndex || (selectedAnswer === index && index !== quiz.correctIndex)) && styles.optionLabelLight
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
    </View>
  );

  const renderSpeakingQuiz = () => (
    <View style={styles.quizContent}>
      <Surface style={styles.questionSurface}>
        <Title style={styles.questionText}>
          {currentQuiz.type === 'speaking' && currentQuiz.prompt[language as 'en' | 'ja']}
        </Title>
      </Surface>
      {!showResult ? (
        <View style={styles.speakingContainer}>
          <RecordButton onRecordFinish={handleRecordingComplete} />
        </View>
      ) : (
        <Surface style={styles.feedbackSection}>
          {speakingResult && (
            <>
              <PaperText style={styles.feedbackComment}>
                {speakingResult.comment}
              </PaperText>
              <View style={styles.scoreRow}>
                <PaperText style={styles.scoreLabel}>Accuracy</PaperText>
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
                <PaperText style={styles.scoreLabel}>Fluency</PaperText>
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
                <PaperText style={styles.scoreLabel}>Overall</PaperText>
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
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header}>
        <PaperText style={styles.lessonTitle}>
          {lesson.title[language as 'en' | 'ja']}
        </PaperText>
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
        <Surface style={styles.footer}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBadge: {
    backgroundColor: '#7C4DFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  quizContent: {
    flex: 1,
  },
  questionSurface: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
  },
  questionText: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionWrapper: {
    marginBottom: 12,
  },
  option: {
    borderRadius: 12,
    elevation: 2,
  },
  optionContent: {
    height: 56,
  },
  optionLabel: {
    fontSize: 16,
    letterSpacing: 0.5,
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
    alignItems: 'center',
    marginTop: 32,
  },
  feedbackSection: {
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    elevation: 2,
  },
  feedbackComment: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  scoreRow: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666666',
  },
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  scoreBadge: {
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    elevation: 8,
  },
  nextButton: {
    borderRadius: 12,
  },
  nextButtonContent: {
    height: 48,
  },
  nextButtonLabel: {
    fontSize: 16,
    letterSpacing: 1,
  },
}); 