import { courseContent, quizQuestions } from "../client/src/lib/courses";

// Format the course data for database storage
export const courseData = {
  chapters: courseContent.chapters.map((chapter, index) => {
    return {
      title: chapter.title,
      number: chapter.number,
      description: chapter.description,
      content: chapter.content,
      quiz: quizQuestions[index].map(question => ({
        questionText: question.questionText,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      }))
    };
  })
};
