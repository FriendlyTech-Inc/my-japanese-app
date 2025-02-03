import React, { useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContext } from '../context/AppContext';
import i18n from '../i18n/i18n';
import lessonsData from '../../assets/data/lessons.json';
import { Lesson } from '../types/LessonTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonList'>;

const typedLessonsData = lessonsData as Lesson[];

export default function LessonListScreen({ navigation }: Props) {
  const { language, completedLessons } = useContext(AppContext);

  const renderItem = ({ item }: { item: Lesson }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id })}
    >
      <Card.Content style={styles.cardContent}>
        <Title>{item.title[language as 'en' | 'ja']}</Title>
        {completedLessons.includes(item.id) && (
          <IconButton
            icon="check-circle"
            size={24}
            iconColor="#4CAF50"
          />
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={typedLessonsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 