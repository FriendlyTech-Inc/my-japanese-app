export interface Phrase {
  ja: string;
  en: string;
}

export interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  question: {
    ja: string;
    en: string;
  };
  options: {
    ja: string;
    en: string;
  }[];
  correctIndex: number;
}

export interface SpeakingQuestion {
  type: 'speaking';
  prompt: {
    ja: string;
    en: string;
  };
  answer: {
    ja: string;
    en: string;
  };
}

export type Quiz = MultipleChoiceQuestion | SpeakingQuestion;

export interface Lesson {
  id: number;
  title: { ja: string; en: string };
  phrases: Phrase[];
  quizzes: Quiz[];
} 