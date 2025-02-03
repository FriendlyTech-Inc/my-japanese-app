import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import LessonListScreen from '../screens/LessonListScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import QuizScreen from '../screens/QuizScreen';
import i18n from '../i18n/i18n';

export type RootStackParamList = {
  LanguageSelect: undefined;
  LessonList: undefined;
  LessonDetail: { lessonId: number };
  Quiz: { lessonId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="LanguageSelect"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="LanguageSelect"
          component={LanguageSelectScreen}
          options={{ title: i18n.t('selectLanguage') }}
        />
        <Stack.Screen
          name="LessonList"
          component={LessonListScreen}
          options={{ title: i18n.t('lessons') }}
        />
        <Stack.Screen
          name="LessonDetail"
          component={LessonDetailScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ title: i18n.t('start_quiz') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 