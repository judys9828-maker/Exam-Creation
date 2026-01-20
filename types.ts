
export interface ExamChoices {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface ExamItem {
  no: number;
  question: string;
  choices: ExamChoices;
  answer: string;
  rationale: string;
}

export interface TOSEntry {
  competency: string;
  numItems: number;
  percentage: string;
  itemPlacement: string;
}

export interface Exam {
  title: string;
  instructions: string;
  tos: TOSEntry[];
  items: ExamItem[];
}

export type GradeLevel = 
  | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' 
  | 'Grade 5' | 'Grade 6' | 'Grade 7' | 'Grade 8' 
  | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12';

export type Language = 'Tagalog' | 'English';

export interface ExamFormData {
  topic: string;
  gradeLevel: GradeLevel;
  itemCount: number;
  language: Language;
  questionType: 'Multiple Choice';
}
