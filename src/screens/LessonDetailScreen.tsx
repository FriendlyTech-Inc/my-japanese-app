import React, { useContext } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContext } from '../context/AppContext';
import i18n from '../i18n/i18n';
import lessonsData from '../../assets/data/lessons.json';
import { Lesson } from '../types/LessonTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonDetail'>;

const typedLessonsData = lessonsData as Lesson[];

export default function LessonDetailScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const { language } = useContext(AppContext);
  
  const lesson = typedLessonsData.find(l => l.id === lessonId);
  
  if (!lesson) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>
        {lesson.title[language as 'en' | 'ja']}
      </Title>
      
      <View style={styles.phrasesContainer}>
        {lesson.phrases.map((phrase, index) => (
          <Card key={index} style={styles.phraseCard}>
            <Card.Content>
              <Paragraph style={styles.japanese}>{phrase.ja}</Paragraph>
              <Paragraph style={styles.english}>{phrase.en}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Button
        mode="contained"
        style={styles.quizButton}
        onPress={() => navigation.navigate('Quiz', { lessonId })}
      >
        {i18n.t('start_quiz')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  phrasesContainer: {
    marginBottom: 24,
  },
  phraseCard: {
    marginBottom: 12,
  },
  japanese: {
    fontSize: 18,
    marginBottom: 4,
  },
  english: {
    fontSize: 16,
    color: '#666',
  },
  quizButton: {
    marginBottom: 24,
  },
}); 