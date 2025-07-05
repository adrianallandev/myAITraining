# AI Expert Training Course React App

## Description
This React application provides an interactive 8-week AI training course for IT professionals, with daily 15-minute lessons and multiple-choice questions (MCQs) for learning challenges. It includes immediate feedback and progress tracking, optimized for macOS.

## Setup Instructions for macOS
1. **Prerequisites**:
   - Install Node.js (v18 or later recommended) from https://nodejs.org. Verify with `node -v` and `npm -v` in Terminal.
   - Ensure a code editor (e.g., VS Code) is installed.

2. **Setup Project Structure**:
   - Create a folder named `AI_Expert_Course_App`.
   - Place `index.html`, `package.json`, `vite.config.js`, and `README.md` in the root folder.
   - Create a `src` folder and place `App.jsx`, `index.js`, and `styles.css` inside it.
   - Create a `src/data` folder and place `lessons.json` inside it.
   - Folder structure:
     ```
     AI_Expert_Course_App/
     ├── index.html
     ├── package.json
     ├── vite.config.js
     ├── README.md
     ├── src/
     │   ├── App.jsx
     │   ├── index.js
     │   ├── styles.css
     │   ├── data/
     │       ├── lessons.json
     ```

3. **Install Dependencies**:
   - Open Terminal and navigate to the project folder: `cd AI_Expert_Course_App`.
   - Run `npm install` to install React, Vite, and other dependencies.

4. **Run the Application**:
   - Run `npm run dev` to start the Vite development server.
   - Open `http://localhost:3000` in a browser (e.g., Safari, Chrome).
   - If you see the Vite CJS deprecation warning, ensure Node.js is v18 or later and `package.json` includes `"type": "module"`.

5. **Troubleshooting**:
   - **CJS Deprecation Error**: Upgrade Node.js to v18 or later (run `brew install node@18` if using Homebrew). Verify with `node -v`.
   - If `npm install` fails, clear the cache with `npm cache clean --force` and retry.
   - For permission issues, use `sudo npm install` (enter your MacBook password).
   - Ensure all files are in the correct folder structure.
   - If the app doesn't load, check for errors in the Terminal or browser console (right-click, Inspect, Console tab).

## Features
- 40 daily lessons with detailed content and MCQs.
- Immediate feedback on MCQ answers.
- Navigation between lessons with progress tracking.
- Responsive design using Tailwind CSS.
- Local execution with Vite for fast performance.

## Notes
- The `lessons.json` file contains all course content and MCQs (first 5 lessons included here; request full file if needed).
- Ensure a stable internet connection for Tailwind CSS CDN.
- For production, run `npm run build` to create an optimized build.
- Refer to https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for additional Vite troubleshooting.