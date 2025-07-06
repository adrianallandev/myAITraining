import React, { useState, useEffect } from 'react';
import './styles.css';

// Fallback data in case JSON loading fails
const fallbackData = {
  displayName: "Fallback Training",
  lessons: [
    {
      title: "Introduction",
      introduction: "Welcome to the fallback training.",
      coreConcept: "This is a fallback lesson.",
      table: [{ Concept: "Fallback", Description: "Default content" }],
      diagram: "console.log('Fallback lesson');",
      mcq: {
        question: "What is this?",
        options: ["Fallback", "Error"],
        correctAnswer: "a",
        explanation: "This is a fallback lesson."
      },
      references: []
    }
  ]
};

function App() {
  const [files, setFiles] = useState([]);
  const [dataMap, setDataMap] = useState({});
  const [currentTraining, setCurrentTraining] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useListView, setUseListView] = useState(false); // Toggle between dropdown and list
  const [error, setError] = useState(null);

  // Load JSON files dynamically
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const importedFiles = import.meta.glob('./data/*.json', { eager: true });
        const loadedFiles = [];
        const loadedData = {};

        for (const [path, module] of Object.entries(importedFiles)) {
          const fileName = path.split('/').pop();
          const data = module.default;

          // Validate JSON structure
          if (data && data.displayName && Array.isArray(data.lessons)) {
            loadedFiles.push(fileName);
            loadedData[fileName] = data;
          } else {
            console.warn(`Invalid JSON structure in ${fileName}`);
          }
        }

        if (loadedFiles.length === 0) {
          console.warn('No valid JSON files found, using fallback data');
          loadedFiles.push('fallback.json');
          loadedData['fallback.json'] = fallbackData;
        }

        setFiles(loadedFiles);
        setDataMap(loadedData);
        setCurrentTraining(loadedFiles[0]);
        setCurrentLesson(0);
      } catch (error) {
        console.error('Error loading JSON files:', error);
        setError('Failed to load training data. Using fallback.');
        setDataMap({ 'fallback.json': fallbackData });
        setFiles(['fallback.json']);
        setCurrentTraining('fallback.json');
      }
    };

    loadFiles();
  }, []);

  // Handle training selection
  const handleTrainingChange = (event) => {
    setCurrentTraining(event.target.value);
    setCurrentLesson(0); // Reset to first lesson
  };

  // Handle lesson selection
  const handleLessonChange = (index) => {
    setCurrentLesson(Number(index));
  };

  // Toggle between dropdown and list view
  const toggleView = () => {
    setUseListView(!useListView);
  };

  // Navigate to previous lesson
  const handlePrevious = () => {
    setCurrentLesson((prev) => Math.max(0, prev - 1));
  };

  // Navigate to next lesson
  const handleNext = () => {
    setCurrentLesson((prev) =>
      Math.min(prev + 1, dataMap[currentTraining]?.lessons.length - 1 || 0)
    );
  };

  // Toggle modal for diagram
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Get current lesson data
  const currentLessonData = dataMap[currentTraining]?.lessons[currentLesson] || fallbackData.lessons[0];

  return (
    <div className="container">
      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Training Selector */}
      <div className="mb-4">
        <label htmlFor="training-selector" className="text-lg font-bold text-white mr-2">
          Select Training:
        </label>
        <select
          id="training-selector"
          className="training-selector"
          value={currentTraining || ''}
          onChange={handleTrainingChange}
        >
          {files.map((file) => (
            <option key={file} value={file}>
              {dataMap[file]?.displayName || file}
            </option>
          ))}
        </select>
      </div>

      {/* Lesson Selector */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-lg font-bold text-white">Select Lesson:</p>
          <button className="nav-button" onClick={toggleView}>
            {useListView ? 'Use Dropdown' : 'Use List'}
          </button>
        </div>
        {useListView ? (
          <ul className="lesson-list">
            {dataMap[currentTraining]?.lessons.map((lesson, index) => (
              <li
                key={index}
                className={`lesson-item ${currentLesson === index ? 'active' : ''}`}
                onClick={() => handleLessonChange(index)}
              >
                Lesson {index + 1}: {lesson.title}
              </li>
            ))}
          </ul>
        ) : (
          <select
            id="lesson-selector"
            className="training-selector"
            value={currentLesson}
            onChange={(e) => handleLessonChange(e.target.value)}
          >
            {dataMap[currentTraining]?.lessons.map((lesson, index) => (
              <option key={index} value={index}>
                Lesson {index + 1}: {lesson.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lesson Content */}
      <h1 className="text-3xl font-bold mb-4 text-white">{currentLessonData.title}</h1>
      <p className="text-lg mb-4">{currentLessonData.introduction || currentLessonData.content}</p>
      <p className="text-lg mb-4">{currentLessonData.coreConcept || currentLessonData.extraInfo}</p>

      {/* Table */}
      {currentLessonData.table && (
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              {Object.keys(currentLessonData.table[0]).map((key) => (
                <th key={key} className="border px-4 py-2 text-white">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentLessonData.table.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i} className="border px-4 py-2">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Diagram/Code */}
      {currentLessonData.diagram && (
        <div className="mb-4">
          <button className="nav-button" onClick={toggleModal}>
            {isModalOpen ? 'Hide Code' : 'Show Code'}
          </button>
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={toggleModal}>×</span>
                <pre>{currentLessonData.diagram}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MCQ */}
      {currentLessonData.mcq && (
        <div className="mb-4">
          <p className="text-lg font-bold text-white">{currentLessonData.mcq.question}</p>
          <ul>
            {currentLessonData.mcq.options.map((option, index) => (
              <li key={index} className="text-lg">{String.fromCharCode(97 + index)}. {option}</li>
            ))}
          </ul>
          <p className="text-lg">
            <strong>Answer:</strong> {currentLessonData.mcq.correctAnswer}. {currentLessonData.mcq.explanation}
          </p>
        </div>
      )}

      {/* References */}
      {currentLessonData.references && currentLessonData.references.length > 0 && (
        <div className="mb-4">
          <p className="text-lg font-bold text-white">References:</p>
          <ul>
            {currentLessonData.references.map((ref, index) => (
              <li key={index} className="text-lg">
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-300">
                  {ref.title}
                </a>: {ref.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentLesson === 0}
        >
          Previous
        </button>
        <button
          className="nav-button"
          onClick={handleNext}
          disabled={currentLesson >= (dataMap[currentTraining]?.lessons.length - 1 || 0)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;