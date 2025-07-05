import { useState, useEffect, useMemo } from 'react';
import lessons from './data/lessons.json';

function App() {
  const [currentLesson, setCurrentLesson] = useState(() => {
    try {
      const savedLesson = localStorage.getItem('currentLesson');
      const parsedLesson = parseInt(savedLesson, 10);
      return savedLesson && !isNaN(parsedLesson) ? parsedLesson : 0;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return 0;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('currentLesson', currentLesson);
      console.log('Saved currentLesson:', currentLesson);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [currentLesson]);

  useEffect(() => {
    console.log('Resetting MCQ state for lesson:', currentLesson, 'isSubmitted:', false);
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(null);
  }, [currentLesson]);

  useEffect(() => {
    if (!lessons?.lessons || !Array.isArray(lessons.lessons) || lessons.lessons.length === 0 || currentLesson >= lessons.lessons.length || currentLesson < 0) {
      console.log('Resetting currentLesson to 0 due to invalid index or lessons data');
      setCurrentLesson(0);
      localStorage.removeItem('currentLesson');
    }
  }, [currentLesson, lessons]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!lessons?.lessons || !Array.isArray(lessons.lessons) || lessons.lessons.length === 0) {
    return <div className="p-2 text-red-600">Error: Lessons data is not loaded or invalid</div>;
  }

  const lesson = useMemo(() => lessons.lessons[currentLesson], [currentLesson, lessons]);

  if (!lesson) {
    return <div className="p-2 text-red-600">Error: Invalid lesson data</div>;
  }

  const getCorrectOptionIndex = (correctAnswer) => {
    if (!correctAnswer || typeof correctAnswer !== 'string') return -1;
    const letter = correctAnswer.toLowerCase();
    const index = letter.charCodeAt(0) - 97;
    return index >= 0 && index < lesson.mcq?.options?.length ? index : -1;
  };

  const handleOptionSelect = (index) => {
    if (!isSubmitted) {
      console.log('Selected option:', index, 'isSubmitted:', isSubmitted);
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) {
      console.log('No option selected');
      return;
    }
    setIsSubmitted(true);
    const correctIndex = getCorrectOptionIndex(lesson.mcq?.correctAnswer);
    const isAnswerCorrect = selectedOption === correctIndex;
    setIsCorrect(isAnswerCorrect);
    console.log('Submitted answer:', {
      selected: lesson.mcq?.options[selectedOption],
      correct: lesson.mcq?.options[correctIndex] || 'Invalid',
      isCorrect
    });
  };

  const handleReset = () => {
    console.log('Resetting MCQ state');
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  return (
    <div className="p-2 max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="bg-gray-50 p-2 mb-2">
        <p className="text-lg font-semibold">
          Lesson {currentLesson + 1} of {lessons.lessons.length}
        </p>
      </div>

      {/* Lesson title */}
      <div className="bg-off-white p-2 mb-2">
        <h1 className="text-3xl font-bold">{lesson.title || 'No title available'}</h1>
      </div>

      {/* Introduction */}
      <div className="bg-gray-blue-50 p-2 mb-2">
        <p className="text-lg">{lesson.introduction || 'No introduction available'}</p>
      </div>

      {/* Core concept */}
      <div className="bg-blue-gray-50 p-2 mb-2">
        <p className="text-lg">{lesson.coreConcept || 'No core concept available'}</p>
      </div>

      {/* Table rendering */}
      {lesson.table && Array.isArray(lesson.table) && lesson.table.length > 0 && lesson.table.every(row => typeof row === 'object') ? (
        <div className="mb-2">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                {Object.keys(lesson.table[0]).map((key) => (
                  <th key={key} className="border px-4 py-1.5 text-left">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lesson.table.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="border px-4 py-1.5">{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 p-2 mb-2">
          <p>No table data available</p>
        </div>
      )}

      {/* Diagram rendering */}
      {lesson.diagram && typeof lesson.diagram === 'string' ? (
        <div className="bg-gray-800 p-2 mb-2">
          <h2 className="text-xl font-semibold mb-2 text-white">Diagram</h2>
          <pre className="text-white font-mono text-base overflow-x-auto whitespace-pre">
            {lesson.diagram}
          </pre>
        </div>
      ) : (
        <div className="bg-gray-50 p-2 mb-2">
          <p>No diagram available</p>
        </div>
      )}

      {/* MCQ rendering */}
      {lesson.mcq && Array.isArray(lesson.mcq.options) && lesson.mcq.options.length > 0 && lesson.mcq.question && lesson.mcq.correctAnswer ? (
        <div className="bg-light-gray p-2 mb-2">
          <h2 className="text-xl font-semibold mb-2">{lesson.mcq.question}</h2>
          <ul className="list-none mb-2 space-y-2">
            {lesson.mcq.options.map((option, index) => (
              <li key={index} className="ml-4">
                <button
                  className={`inline-block max-w-md text-left px-4 py-1.5 rounded border ${
                    selectedOption === index
                      ? isSubmitted
                        ? isCorrect
                          ? 'bg-green-100 border-green-500'
                          : 'bg-red-100 border-red-500'
                        : 'bg-blue-100 border-blue-500'
                      : 'bg-white border-gray-300 hover:bg-gray-100'
                  } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => handleOptionSelect(index)}
                  disabled={isSubmitted}
                >
                  {String.fromCharCode(97 + index)}. {option}
                </button>
              </li>
            ))}
          </ul>
          {!isSubmitted && (
            <button
              className="nav-button"
              onClick={handleSubmit}
              disabled={selectedOption === null}
            >
              Submit
            </button>
          )}
          {isSubmitted && (
            <div className="mt-2">
              <p className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                {isCorrect ? 'Correct!' : 'Incorrect.'}
              </p>
              <p className="mt-1">
                Correct Answer: {lesson.mcq.options[getCorrectOptionIndex(lesson.mcq.correctAnswer)] || 'Invalid'}
              </p>
              <p>Explanation: {lesson.mcq.explanation || 'No explanation available'}</p>
              <button
                className="nav-button"
                onClick={handleReset}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-2 mb-2">
          <p className="text-red-600">MCQ data is missing or invalid</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="bg-faint-blue p-2 mb-2 flex justify-between items-center gap-2">
        <button
          className={`nav-button ${currentLesson === 0 ? 'nav-button-disabled' : ''}`}
          onClick={() => setCurrentLesson((prev) => Math.max(0, prev - 1))}
          disabled={currentLesson === 0}
        >
          Previous
        </button>
        <button
          className="nav-button"
          onClick={() => setIsModalOpen(true)}
        >
          Show References 📚
        </button>
        <button
          className={`nav-button ${currentLesson === lessons.lessons.length - 1 ? 'nav-button-disabled' : ''}`}
          onClick={() => setCurrentLesson((prev) => Math.min(lessons.lessons.length - 1, prev + 1))}
          disabled={currentLesson === lessons.lessons.length - 1}
        >
          Next
        </button>
      </div>

      {/* Modal for references */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-semibold mb-2">References</h2>
            {lesson.references && Array.isArray(lesson.references) && lesson.references.length > 0 ? (
              <ul className="list-disc ml-6 mb-4">
                {lesson.references.map((ref, index) => (
                  <li key={index} className="mb-1">
                    {ref.title}: {ref.description}{' '}
                    {ref.url ? (
                      <a href={ref.url} className="text-blue-500 underline hover:text-blue-700" target="_blank" rel="noopener noreferrer">
                        Link
                      </a>
                    ) : (
                      'No link available'
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4">No references available</p>
            )}
            <button
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;