import { useState, useEffect } from 'react';
import lessons from './data/lessons.json';

// Main component for the AI Expert Training Course app, rendering lessons, MCQs, references, and try-again functionality with modernized button styles
function App() {
    // Initialize currentLesson from localStorage (if available) or default to 0
    const [currentLesson, setCurrentLesson] = useState(() => {
        const savedLesson = localStorage.getItem('currentLesson');
        // Parse saved value and ensure it's a valid index
        const initialLesson = savedLesson ? parseInt(savedLesson, 10) : 0;
        return initialLesson >= 0 && initialLesson < lessons.length ? initialLesson : 0;
    });
    // State to store the user's selected MCQ answer (e.g., 'a', 'b'), initially null
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    // State to store feedback after answering an MCQ (e.g., "Correct!" or "Incorrect..."), initially null
    const [feedback, setFeedback] = useState(null);
    // State to track whether references are visible, default to false to hide initially
    const [showReferences, setShowReferences] = useState(false);

    // Save currentLesson to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('currentLesson', currentLesson);
    }, [currentLesson]);

    // Reset showReferences to false when currentLesson changes (e.g., on navigation)
    useEffect(() => {
        setShowReferences(false);
    }, [currentLesson]);

    // Handles MCQ answer selection
    // Compares the selected answer with the correct answer and sets feedback
    const handleAnswer = (answer) => {
        const correct = answer === lessons[currentLesson].mcq.correctAnswer;
        setFeedback(correct ? 'Correct!' : `Incorrect. ${lessons[currentLesson].mcq.explanation}`);
        setSelectedAnswer(answer);
    };

    // Resets MCQ state to allow re-selecting an answer
    const resetAnswer = () => {
        setSelectedAnswer(null);
        setFeedback(null);
    };

    // Toggles the visibility of the references section
    const toggleReferences = () => {
        setShowReferences((prev) => !prev);
    };

    // Advances to the next lesson
    // Loops to the first lesson if at the end; resets MCQ state
    const nextLesson = () => {
        setCurrentLesson((prev) => (prev < lessons.length - 1 ? prev + 1 : 0));
        setSelectedAnswer(null);
        setFeedback(null);
    };

    // Goes to the previous lesson
    // Loops to the last lesson if at the start; resets MCQ state
    const prevLesson = () => {
        setCurrentLesson((prev) => (prev > 0 ? prev - 1 : lessons.length - 1));
        setSelectedAnswer(null);
        setFeedback(null);
    };

    // Get the current lesson object from the lessons array
    const lesson = lessons[currentLesson];

    // Render the UI with Tailwind CSS for styling
    return (
        // Main container: centered, padded, light gray background, full viewport height
        <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
            {/* App title */}
            <h1 className="text-3xl font-bold mb-4">AI Expert Training Course</h1>
            {/* Lesson card: white background, padded, rounded, with shadow */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Lesson title */}
                <h2 className="text-2xl font-semibold mb-2"> {lesson.title}</h2>
                {/* Lesson introduction */}
                <p className="mb-4">
                    <strong>Introduction:</strong> {lesson.introduction}
                </p>
                {/* Core concept section with references toggle */}
                <div>
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-medium mb-2">Core Concept</h3>
                        {/* References toggle icon with label: shown if lesson.references exists */}
                        {lesson.references && lesson.references.length > 0 && (
                            <button
                                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md shadow-md hover:from-blue-600 hover:to-teal-600 hover:scale-105 transition-all duration-200"
                                onClick={toggleReferences}
                                title={showReferences ? 'Hide References' : 'Show References'}
                            >
                                <span>📚</span>
                                <span>{showReferences ? 'Hide References' : 'Show References'}</span>
                            </button>
                        )}
                    </div>
                    <p className="mb-4">{lesson.coreConcept}</p>
                </div>
                {/* Table: rendered if lesson.table exists */}
                {lesson.table && (
                    <table className="table-auto w-full mb-4">
                        {/* Table headers: dynamically created from the first row's keys */}
                        <thead>
                            <tr>
                                {Object.keys(lesson.table[0]).map((key) => (
                                    <th key={key} className="border px-4 py-2">
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {/* Table rows: map over lesson.table for data */}
                        <tbody>
                            {lesson.table.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, i) => (
                                        <td key={i} className="border px-4 py-2">
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {/* Diagram: rendered as text in a code block if lesson.diagram exists */}
                {lesson.diagram && (
                    <div className="my-4 text-center">
                        <code className="block bg-gray-200 p-2 rounded">{lesson.diagram}</code>
                    </div>
                )}
                {/* MCQ section */}
                <h3 className="text-xl font-medium mb-2">Learning Challenge</h3>
                <p className="mb-2">{lesson.mcq.question}</p>
                {/* Answer buttons: generated from lesson.mcq.options */}
                <div className="space-y-2">
                    {lesson.mcq.options.map((option, index) => (
                        <button
                            key={index}
                            // Dynamic styling: green for correct, red for incorrect, gray otherwise
                            className={`w-full text-left p-2 rounded-md ${
                                selectedAnswer === String.fromCharCode(97 + index)
                                    ? lesson.mcq.correctAnswer === String.fromCharCode(97 + index)
                                        ? 'bg-green-100'
                                        : 'bg-red-100'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            } shadow-sm transition-all duration-200 hover:scale-105`}
                            // Call handleAnswer with answer ID (e.g., 'a', 'b')
                            onClick={() => handleAnswer(String.fromCharCode(97 + index))}
                            // Disable buttons only after a correct answer is selected
                            disabled={selectedAnswer !== null && lesson.mcq.correctAnswer === selectedAnswer}
                        >
                            {/* Label options as a), b), etc. */}
                            {String.fromCharCode(97 + index)}) {option}
                        </button>
                    ))}
                </div>
                {/* Feedback: shown after answering, green for correct, red for incorrect with Try Again button */}
                {feedback && (
                    <div
                        className={`mt-4 p-2 rounded flex items-center justify-between ${
                            feedback.startsWith('Correct') ? 'bg-green-200' : 'bg-red-200'
                        }`}
                    >
                        <span>{feedback}</span>
                        {/* Show Try Again button only for incorrect answers */}
                        {feedback.startsWith('Incorrect') && (
                            <button
                                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md shadow-md hover:from-blue-600 hover:to-teal-600 hover:scale-105 transition-all duration-200"
                                onClick={resetAnswer}
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}
                {/* References: rendered only if showReferences is true and lesson.references exists */}
                {showReferences && lesson.references && lesson.references.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-xl font-medium mb-2">References</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            {lesson.references.map((ref, index) => (
                                <li key={index}>
                                    {ref.url ? (
                                        <a
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {ref.title}
                                        </a>
                                    ) : (
                                        <span>{ref.title}</span>
                                    )}
                                    <p className="text-gray-600 text-sm">{ref.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {/* Navigation buttons */}
                <div className="mt-4 flex justify-between">
                    {/* Previous button: disabled on first lesson */}
                    <button
                        className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md shadow-md hover:from-blue-600 hover:to-teal-600 hover:scale-105 transition-all duration-200 ${
                            currentLesson === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={prevLesson}
                        disabled={currentLesson === 0}
                    >
                        Previous
                    </button>
                    {/* Next button: disabled on last lesson */}
                    <button
                        className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md shadow-md hover:from-blue-600 hover:to-teal-600 hover:scale-105 transition-all duration-200 ${
                            currentLesson === lessons.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={nextLesson}
                        disabled={currentLesson === lessons.length - 1}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

// Export the App component for use in index.jsx
export default App;