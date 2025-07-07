import { useState, useEffect, useMemo } from 'react';
import './styles.css';

function App() {
  const [currentLesson, setCurrentLesson] = useState(() => {
    try {
      const savedLessons = localStorage.getItem('lessonHistory');
      const savedFile = localStorage.getItem('trainingFile') || 'lessons.json';
      const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
      const savedLesson = lessonMap[savedFile];
      const parsedLesson = parseInt(savedLesson, 10);
      return savedLesson !== undefined && !isNaN(parsedLesson) ? parsedLesson : 0;
    } catch (error) {
      console.error('Failed to read lessonHistory from localStorage:', error);
      return 0;
    }
  });

  const [trainingFile, setTrainingFile] = useState(() => {
    try {
      const savedFile = localStorage.getItem('trainingFile');
      return savedFile || 'lessons.json';
    } catch (error) {
      console.error('Failed to read trainingFile from localStorage:', error);
      return 'lessons.json';
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDiagramOpen, setIsDiagramOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [lessonsData, setLessonsData] = useState(null);
  const [error, setError] = useState(null);
  const [trainingFiles, setTrainingFiles] = useState([]);
  const [dataMap, setDataMap] = useState({});

  const fallbackData = {
    displayName: 'Fallback Training',
    lessons: [
      {
        title: 'Fallback Lesson',
        introduction: 'This is a fallback lesson due to invalid data.',
        coreConcept: 'Please check your JSON files in src/data/.',
        table: [{ Message: 'No data available' }],
        diagram: 'N/A',
        mcq: {
          question: 'What is this lesson?',
          options: ['Fallback', 'Error'],
          correctAnswer: 'a',
          explanation: 'This is a fallback lesson due to invalid JSON data.'
        },
        references: [{ title: 'Support', description: 'Contact support for help.' }]
      }
    ]
  };

  // Dynamically load all JSON files from src/data/
  useEffect(() => {
    const loadTrainingFiles = async () => {
      try {
        console.log('Loading JSON files from src/data/');
        const files = import.meta.glob('./data/*.json', { eager: true });
        const loadedFiles = [];
        const loadedData = {};

        for (const [path, module] of Object.entries(files)) {
          const fileName = path.split('/').pop();
          const data = module.default || module;
          console.log(`Processing file: ${fileName}`, data);
          if (data.displayName && data.lessons && Array.isArray(data.lessons) && data.lessons.length > 0) {
            loadedFiles.push(fileName);
            loadedData[fileName] = data;
          } else {
            console.warn(`Invalid JSON structure in ${fileName}: Missing displayName or valid lessons array`);
          }
        }

        if (loadedFiles.length === 0) {
          console.error('No valid JSON files found, using fallback data');
          setError('No valid training data found. Using fallback data.');
          setLessonsData(fallbackData);
          setTrainingFiles(['fallback']);
          setDataMap({ 'fallback': fallbackData });
          setTrainingFile('fallback');
          setCurrentLesson(0);
          try {
            const savedLessons = localStorage.getItem('lessonHistory');
            const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
            lessonMap['fallback'] = 0;
            localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
          } catch (error) {
            console.error('Failed to initialize lessonHistory for fallback:', error);
          }
        } else {
          console.log('Loaded training files:', loadedFiles);
          setTrainingFiles(loadedFiles);
          setDataMap(loadedData);
          if (!loadedFiles.includes(trainingFile)) {
            console.warn(`Selected file ${trainingFile} not found, defaulting to lessons.json`);
            setTrainingFile('lessons.json');
            setCurrentLesson(0);
            try {
              const savedLessons = localStorage.getItem('lessonHistory');
              const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
              lessonMap['lessons.json'] = 0;
              localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
            } catch (error) {
              console.error('Failed to initialize lessonHistory:', error);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load JSON files:', err);
        setError('Failed to load training data. Using fallback data.');
        setLessonsData(fallbackData);
        setTrainingFiles(['fallback']);
        setDataMap({ 'fallback': fallbackData });
        setTrainingFile('fallback');
        setCurrentLesson(0);
        try {
          const savedLessons = localStorage.getItem('lessonHistory');
          const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
          lessonMap['fallback'] = 0;
          localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
        } catch (error) {
          console.error('Failed to initialize lessonHistory for fallback:', error);
        }
      }
    };

    loadTrainingFiles();
  }, []);

  // Save trainingFile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trainingFile', trainingFile);
      console.log('Saved trainingFile to localStorage:', trainingFile);
    } catch (error) {
      console.error('Failed to save trainingFile to localStorage:', error);
    }
  }, [trainingFile]);

  // Save lessonHistory to localStorage only when currentLesson changes
  useEffect(() => {
    try {
      const savedLessons = localStorage.getItem('lessonHistory');
      const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
      lessonMap[trainingFile] = currentLesson;
      localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
      console.log('Saved lessonHistory to localStorage:', { trainingFile, lessonHistory: lessonMap });
    } catch (error) {
      console.error('Failed to save lessonHistory to localStorage:', error);
    }
  }, [currentLesson]);

  // Load lesson history when trainingFile or dataMap changes
  useEffect(() => {
    try {
      const savedLessons = localStorage.getItem('lessonHistory');
      const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
      const savedLesson = lessonMap[trainingFile];
      const parsedLesson = parseInt(savedLesson, 10);
      const maxLesson = dataMap[trainingFile]?.lessons?.length - 1 || 0;
      if (savedLesson !== undefined && !isNaN(parsedLesson) && parsedLesson >= 0 && parsedLesson <= maxLesson) {
        setCurrentLesson(parsedLesson);
        console.log(`Loaded lesson for ${trainingFile}:`, parsedLesson);
      } else {
        setCurrentLesson(0);
        lessonMap[trainingFile] = 0;
        localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
        console.log(`No valid saved lesson for ${trainingFile}, initialized to 0`);
      }
    } catch (error) {
      console.error('Failed to load lessonHistory for', trainingFile, ':', error);
      setCurrentLesson(0);
      try {
        const savedLessons = localStorage.getItem('lessonHistory');
        const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
        lessonMap[trainingFile] = 0;
        localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
      } catch (err) {
        console.error('Failed to initialize lessonHistory for', trainingFile, ':', err);
      }
    }
  }, [trainingFile, dataMap]);

  // Validate data and set lessonsData
  useEffect(() => {
    const validateData = (data, file) => {
      if (!data?.lessons || !Array.isArray(data.lessons) || data.lessons.length === 0 || !data.displayName) {
        console.error('Invalid data structure for', file, ':', data);
        return { valid: false, error: `Invalid structure in ${file}: Must have displayName and non-empty lessons array` };
      }
      console.log('Validated data for', file, ':', data);
      return { valid: true, data };
    };

    const loadTraining = () => {
      setError(null);
      const selectedData = dataMap[trainingFile];
      const defaultFile = 'lessons.json';
      let result = { valid: false, error: `Data not found for ${trainingFile}` };

      if (selectedData) {
        result = validateData(selectedData, trainingFile);
      }

      if (!result.valid && trainingFile !== defaultFile && dataMap[defaultFile]) {
        console.warn(`Falling back to default file: ${defaultFile}`);
        result = validateData(dataMap[defaultFile], defaultFile);
        if (result.valid) {
          setTrainingFile(defaultFile);
          setError(`Invalid data in ${dataMap[trainingFile]?.displayName || trainingFile}. Loaded ${dataMap[defaultFile].displayName} instead.`);
          try {
            const savedLessons = localStorage.getItem('lessonHistory');
            const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
            lessonMap[defaultFile] = lessonMap[defaultFile] || 0;
            localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
          } catch (error) {
            console.error('Failed to initialize lessonHistory for default file:', error);
          }
        }
      }

      if (!result.valid) {
        console.warn('All data invalid, using fallback data');
        setLessonsData(fallbackData);
        setError(`Failed to load valid data for ${dataMap[trainingFile]?.displayName || trainingFile}${trainingFile !== defaultFile ? ` and ${dataMap[defaultFile]?.displayName || defaultFile}` : ''}. Using fallback data.`);
        setTrainingFile('fallback');
        setDataMap((prev) => ({ ...prev, 'fallback': fallbackData }));
        setTrainingFiles(['fallback']);
        setCurrentLesson(0);
        try {
          const savedLessons = localStorage.getItem('lessonHistory');
          const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
          lessonMap['fallback'] = 0;
          localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
        } catch (error) {
          console.error('Failed to initialize lessonHistory for fallback:', error);
        }
      } else {
        setLessonsData(result.data);
        if (currentLesson >= result.data.lessons.length || currentLesson < 0) {
          console.log('Resetting currentLesson to 0 due to invalid index');
          setCurrentLesson(0);
          try {
            const savedLessons = localStorage.getItem('lessonHistory');
            const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
            lessonMap[trainingFile] = 0;
            localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
          } catch (error) {
            console.error('Failed to reset lessonHistory for', trainingFile, ':', error);
          }
        }
      }
    };

    if (Object.keys(dataMap).length > 0) {
      loadTraining();
    }
  }, [trainingFile, dataMap]);

  // Reset MCQ state when lesson or file changes
  useEffect(() => {
    console.log('Resetting MCQ state for lesson:', currentLesson, 'isSubmitted:', false);
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(null);
  }, [currentLesson, trainingFile]);

  // Scroll to top when lesson changes
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log('Scrolled to top for lesson:', currentLesson);
  }, [currentLesson]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        console.log('Escape key pressed, closing modal');
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle lesson selection
  const handleLessonSelect = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    console.log('Selected lesson:', newIndex, 'title:', lessonsData?.lessons[newIndex]?.title || 'No title');
    setCurrentLesson(newIndex);
  };

  // Handle diagram toggle
  const handleDiagramToggle = () => {
    setIsDiagramOpen((prev) => {
      console.log('Toggling diagram, new state:', !prev);
      return !prev;
    });
  };

  // Handle reset to start for current training file only
  const handleStartOver = () => {
    console.log(`Starting over for ${trainingFile}: resetting lesson to 0`);
    setCurrentLesson(0);
    try {
      const savedLessons = localStorage.getItem('lessonHistory');
      const lessonMap = savedLessons ? JSON.parse(savedLessons) : {};
      lessonMap[trainingFile] = 0;
      localStorage.setItem('lessonHistory', JSON.stringify(lessonMap));
      console.log('Reset lessonHistory for', trainingFile, ':', lessonMap);
    } catch (error) {
      console.error('Failed to reset lessonHistory in localStorage:', error);
    }
  };

  // Define lesson with useMemo
  const lesson = useMemo(() => {
    if (!lessonsData?.lessons || !Array.isArray(lessonsData.lessons) || lessonsData.lessons.length === 0) {
      console.warn('No valid lessons data, returning null');
      return null;
    }
    return lessonsData.lessons[currentLesson];
  }, [currentLesson, lessonsData]);

  // Render error state
  if (error && trainingFile === 'fallback') {
    return (
      <div className="container">
        <div className="error-message p-2 mb-2">
          <p>{error}</p>
          <p>Ensure valid JSON files are in src/data/ or contact support.</p>
          <button className="retry-button" onClick={handleStartOver}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const getCorrectOptionIndex = (correctAnswer) => {
    if (!correctAnswer || typeof correctAnswer !== 'string') return -1;
    const letter = correctAnswer.toLowerCase();
    const index = letter.charCodeAt(0) - 97;
    return index >= 0 && index < lesson?.mcq?.options?.length ? index : -1;
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
    <div className="container">
      {error && (
        <div className="error-message p-2 mb-2">
          <p>{error}</p>
          <button className="retry-button" onClick={handleStartOver}>
            Start Over
          </button>
        </div>
      )}

      <div className="bg-gray-50 p-2 mb-2 nav-container">
        <div className="selector-container">
          <label htmlFor="training-selector" className="text-lg font-semibold">
            Select Training:
          </label>
          <select
            id="training-selector"
            className="training-selector"
            value={trainingFile}
            onChange={(e) => {
              console.log('Selected training file:', e.target.value);
              setTrainingFile(e.target.value);
            }}
          >
            {trainingFiles.length > 0 ? (
              trainingFiles.map((file) => (
                <option key={file} value={file}>
                  {dataMap[file]?.displayName || file.replace('.json', '')}
                </option>
              ))
            ) : (
              <option value="fallback">Fallback Training</option>
            )}
          </select>
        </div>
        <div className="selector-container">
          <label htmlFor="lesson-selector" className="text-lg font-semibold">
            Select Lesson:
          </label>
          <select
            id="lesson-selector"
            className="lesson-selector"
            value={currentLesson}
            onChange={handleLessonSelect}
          >
            {lessonsData?.lessons?.length > 0 ? (
              lessonsData.lessons.map((lesson, index) => (
                <option key={index} value={index}>
                  {lesson.title || `No title available`}
                </option>
              ))
            ) : (
              <option value={0}>No title available</option>
            )}
          </select>
        </div>
        <button className="nav-button w-full" onClick={handleStartOver}>
          Start Over
        </button>
        {lessonsData && (
          <p className="text-lg font-semibold mt-2">
            Lesson {currentLesson + 1} of {lessonsData.lessons.length}
          </p>
        )}
      </div>

      {!lesson ? (
        <div className="error-message p-2 mb-2">
          <p>Loading lesson data...</p>
          <button className="retry-button" onClick={handleStartOver}>
            Start Over
          </button>
        </div>
      ) : (
        <>
          <div className="bg-off-white p-2 mb-2">
            <h1 className="text-3xl font-bold">{lesson.title || 'No title available'}</h1>
          </div>

          <div className="bg-gray-blue-50 p-2 mb-2">
            <p className="text-lg">{lesson.introduction || 'No introduction available'}</p>
          </div>

          <div className="bg-blue-gray-50 p-2 mb-2">
            <p className="text-lg">{lesson.coreConcept || 'No core concept available'}</p>
          </div>

          {lesson.table && Array.isArray(lesson.table) && lesson.table.length > 0 && lesson.table.every(row => typeof row === 'object') ? (
            <div className="mb-2 overflow-x-auto">
              <table className="table-auto w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    {Object.keys(lesson.table[0]).map((key) => (
                      <th key={key} className="border text-left">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lesson.table.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="border">{value}</td>
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

          {lesson.diagram && typeof lesson.diagram === 'string' ? (
            <>
              <label className="toggle-switch-label mb-2">
                <input
                  type="checkbox"
                  checked={isDiagramOpen}
                  onChange={handleDiagramToggle}
                  className="toggle-switch"
                />
                <span className="toggle-slider"></span>
                Show Diagram
              </label>
              <div className="bg-gray-800 p-2 mb-2">
                <h2 className="text-xl font-semibold mb-2 text-white">Diagram</h2>
                {isDiagramOpen && (
                  <pre className="text-white font-mono text-base overflow-x-auto whitespace-pre">
                    {lesson.diagram}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="bg-gray-50 p-2 mb-2">
              <p>No diagram available</p>
            </div>
          )}

          {lesson.mcq && Array.isArray(lesson.mcq.options) && lesson.mcq.options.length > 0 && lesson.mcq.question && lesson.mcq.correctAnswer ? (
            <div className="bg-light-gray p-2 mb-2">
              <h2 className="text-xl font-semibold mb-2">{lesson.mcq.question}</h2>
              <ul className="list-none mb-2 space-y-2">
                {lesson.mcq.options.map((option, index) => (
                  <li key={index} className="ml-4">
                    <button
                      className={`inline-block max-w-md text-left px-4 py-1.5 rounded border w-full ${
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
                  className="nav-button mt-2 w-full"
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
                  {isCorrect && (
                    <p className="mt-1">
                      Correct Answer: {lesson.mcq.options[getCorrectOptionIndex(lesson.mcq.correctAnswer)] || 'Invalid'}
                    </p>
                  )}
                  <p>Explanation: {lesson.mcq.explanation || 'No explanation available'}</p>
                  {!isCorrect && (
                    <button
                      className="nav-button mt-2 w-full"
                      onClick={handleReset}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-light-gray p-2 mb-2">
              <p className="text-red-600">MCQ data is missing or invalid</p>
            </div>
          )}

          <div className="bg-faint-blue p-2 mb-2 nav-container items-center">
            <button
              className={`nav-button w-full ${currentLesson === 0 ? 'nav-button-disabled' : ''}`}
              onClick={() => setCurrentLesson((prev) => Math.max(0, prev - 1))}
              disabled={currentLesson === 0}
            >
              Previous
            </button>
            <button
              className="nav-button w-full"
              onClick={() => {
                console.log('Opening references modal');
                setIsModalOpen(true);
              }}
            >
              Show References 📚
            </button>
            <button
              className={`nav-button w-full ${currentLesson === lessonsData?.lessons.length - 1 ? 'nav-button-disabled' : ''}`}
              onClick={() => setCurrentLesson((prev) => Math.min(lessonsData.lessons.length - 1, prev + 1))}
              disabled={currentLesson === lessonsData?.lessons.length - 1}
            >
              Next
            </button>
          </div>

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
                  className="modal-close w-full"
                  onClick={() => {
                    console.log('Closing references modal');
                    setIsModalOpen(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;