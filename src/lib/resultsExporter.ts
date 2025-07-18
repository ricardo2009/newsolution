import { ExamSession, Question } from '@/types';

export class ResultsExporter {
  static exportToJSON(session: ExamSession): string {
    const exportData = {
      sessionId: session.id,
      exportDate: new Date().toISOString(),
      exam: {
        startTime: session.startTime,
        endTime: session.endTime,
        mode: session.mode,
        isCompleted: session.isCompleted
      },
      progress: session.userProgress,
      questions: session.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
        correctAnswer: q.correctAnswer
      })),
      categoryStats: this.calculateCategoryStats(session),
      summary: {
        totalQuestions: session.userProgress.totalQuestions,
        correctAnswers: session.userProgress.correctAnswers,
        score: session.userProgress.score,
        percentage: Math.round((session.userProgress.score / session.userProgress.totalQuestions) * 100),
        timeSpent: session.userProgress.timeSpent
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  static exportToCSV(session: ExamSession): string {
    const headers = [
      'ID',
      'Categoria',
      'Dificuldade',
      'Questão',
      'Resposta Correta',
      'Resposta do Usuário',
      'Correto',
      'Tempo Gasto'
    ];

    const rows = session.questions.map(question => {
      const result = session.userProgress.results.find(r => r.questionId === question.id);
      return [
        question.id,
        question.category,
        question.difficulty,
        `"${question.questionText.replace(/"/g, '""')}"`,
        Array.isArray(question.correctAnswer) ? question.correctAnswer.join(';') : question.correctAnswer,
        result ? (Array.isArray(result.userAnswer) ? result.userAnswer.join(';') : result.userAnswer) : 'Não respondida',
        result ? (result.isCorrect ? 'Sim' : 'Não') : 'Não respondida',
        result ? result.timeSpent.toString() : '0'
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  }

  static exportToPDF(session: ExamSession): string {
    // Retorna HTML que pode ser convertido para PDF
    const { userProgress, questions } = session;
    const percentage = Math.round((userProgress.score / userProgress.totalQuestions) * 100);
    const categoryStats = this.calculateCategoryStats(session);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Exame - GitHub Actions GH-200</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .category-stats { margin: 20px 0; }
    .question { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .correct { border-left: 4px solid #10b981; }
    .incorrect { border-left: 4px solid #ef4444; }
    .unanswered { border-left: 4px solid #6b7280; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório de Exame - GitHub Actions GH-200</h1>
    <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
  </div>

  <div class="summary">
    <h2>Resumo</h2>
    <div class="stats">
      <div class="stat">
        <h3>${userProgress.score}</h3>
        <p>Questões Corretas</p>
      </div>
      <div class="stat">
        <h3>${userProgress.totalQuestions}</h3>
        <p>Total de Questões</p>
      </div>
      <div class="stat">
        <h3>${percentage}%</h3>
        <p>Pontuação</p>
      </div>
      <div class="stat">
        <h3>${Math.floor(userProgress.timeSpent / 60)}:${(userProgress.timeSpent % 60).toString().padStart(2, '0')}</h3>
        <p>Tempo Total</p>
      </div>
    </div>
  </div>

  <div class="category-stats">
    <h2>Estatísticas por Categoria</h2>
    ${Object.entries(categoryStats).map(([category, stats]) => `
      <div>
        <strong>${category}:</strong> ${stats.correct}/${stats.total} (${Math.round((stats.correct / stats.total) * 100)}%)
      </div>
    `).join('')}
  </div>

  <div class="questions">
    <h2>Detalhes das Questões</h2>
    ${questions.map(question => {
      const result = userProgress.results.find(r => r.questionId === question.id);
      const status = result ? (result.isCorrect ? 'correct' : 'incorrect') : 'unanswered';
      
      return `
        <div class="question ${status}">
          <h3>${question.category} - ${question.difficulty}</h3>
          <p><strong>Questão:</strong> ${question.questionText}</p>
          <p><strong>Resposta Correta:</strong> ${Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}</p>
          ${result ? `<p><strong>Sua Resposta:</strong> ${Array.isArray(result.userAnswer) ? result.userAnswer.join(', ') : result.userAnswer}</p>` : '<p><strong>Sua Resposta:</strong> Não respondida</p>'}
          <p><strong>Explicação:</strong> ${question.explanation}</p>
          ${result ? `<p><strong>Tempo Gasto:</strong> ${result.timeSpent}s</p>` : ''}
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;

    return html;
  }

  private static calculateCategoryStats(session: ExamSession): Record<string, { total: number; correct: number }> {
    return session.questions.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = { total: 0, correct: 0 };
      }
      acc[question.category].total++;
      
      const result = session.userProgress.results.find(r => r.questionId === question.id);
      if (result && result.isCorrect) {
        acc[question.category].correct++;
      }
      
      return acc;
    }, {} as Record<string, { total: number; correct: number }>);
  }

  static downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
