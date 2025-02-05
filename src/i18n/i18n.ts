import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    appName: "Japanese Learning App",
    selectLanguage: "Select Language",
    english: "English",
    japanese: "Japanese",
    lessons: "Lessons",
    phrases: "phrases",
    quizzes: "quizzes",
    completed: "completed",
    start_quiz: "Start Quiz",
    correct: "Correct",
    incorrect: "Incorrect",
    your_score: "Your Score",
    next: "Next",
    finish: "Finish",
    accuracy: "Accuracy",
    fluency: "Fluency",
    overall: "Overall",
    back: "Back"
  },
  ja: {
    appName: "日本語学習アプリ",
    selectLanguage: "言語を選択",
    english: "英語",
    japanese: "日本語",
    lessons: "レッスン一覧",
    phrases: "フレーズ",
    quizzes: "クイズ",
    completed: "完了",
    start_quiz: "クイズを始める",
    correct: "正解",
    incorrect: "不正解",
    your_score: "あなたのスコア",
    next: "次へ",
    finish: "終了",
    accuracy: "正確性",
    fluency: "流暢さ",
    overall: "総合",
    back: "戻る"
  }
};

const i18n = new I18n(translations);

i18n.locale = Localization.locale;
i18n.enableFallback = true;

export default i18n; 