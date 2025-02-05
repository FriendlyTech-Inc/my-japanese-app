import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import LessonListScreen from '../screens/LessonListScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import QuizScreen from '../screens/QuizScreen';
import i18n from '../i18n/i18n';
import { theme } from '../theme';
import { AppContext } from '../context/AppContext';

export type RootStackParamList = {
  LanguageSelect: undefined;
  LessonList: undefined;
  LessonDetail: { lessonId: number };
  Quiz: { lessonId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { language } = useContext(AppContext);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={language ? "LessonList" : "LanguageSelect"}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.surface,
          headerTitleStyle: {
            ...theme.fonts.headlineLarge,
            color: theme.colors.surface,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        <Stack.Screen
          name="LanguageSelect"
          component={LanguageSelectScreen}
          options={{ 
            title: i18n.t('selectLanguage'),
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="LessonList"
          component={LessonListScreen}
          options={{ 
            title: i18n.t('lessons'),
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="LessonDetail"
          component={LessonDetailScreen}
          options={{ 
            title: '',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ 
            title: i18n.t('start_quiz'),
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 