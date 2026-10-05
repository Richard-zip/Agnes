export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizQuestionResult {
  questionId: number;
  question: string;
  options: string[];
  selectedIndex?: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizEvaluationResult {
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  passed: boolean;
  minRequiredScore: number;
  questionResults: QuizQuestionResult[];
}

export class Quiz {
  static readonly PASSING_SCORE = 80; // 80% mínimo para aprobar

  constructor(
    public readonly id: string,
    public readonly protocolTitle: string,
    public readonly questions: QuizQuestion[],
    public readonly passingScore: number = Quiz.PASSING_SCORE
  ) {}

  get minPassingCorrect(): number {
    return Math.ceil((this.questions.length * this.passingScore) / 100);
  }

  evaluate(userAnswers: Record<number, number>): QuizEvaluationResult {
    let correctCount = 0;
    const questionResults: QuizQuestionResult[] = this.questions.map((q) => {
      const selectedIndex = userAnswers[q.id];
      const isCorrect = selectedIndex === q.correctOptionIndex;
      if (isCorrect) {
        correctCount++;
      }
      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedIndex,
        correctIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = this.questions.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercentage >= this.passingScore;

    return {
      totalQuestions,
      correctCount,
      scorePercentage,
      passed,
      minRequiredScore: this.passingScore,
      questionResults,
    };
  }
}
