# 🐾 Pawk

> A web app to map, track, and identify street dogs using Maps and AI.

![Pawk Banner](./src/assets/banner.png)

## 🌍 Live Demo
Coming soon...

## 🚀 Features
- 🗺️ Interactive Google Maps integration
- 📍 Click to drop pins and mark dog sightings
- 🐶 Real-time dog sighting counter
- 🔥 Firebase backend for saving sightings (Phase 2)
- 🤖 AI-powered dog detection (Phase 3)
- 🧠 Dog recognition using embeddings (Phase 4)

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Maps | Google Maps API |
| Backend | Firebase |
| AI | Python (coming soon) |

## 📁 Project Structure
src/
├── components/     # Reusable UI components
├── pages/          # App pages
├── hooks/          # Custom React hooks
├── services/       # Firebase & API logic
├── assets/         # Images and icons
└── styles/         # CSS files

## ⚙️ Setup Instructions

1. Clone the repo
```bash
   git clone https://github.com/YOUR_USERNAME/pawmap.git
   cd pawmap
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env` file in the root folder

4. Start the app
```bash
   npm start
```

## 🗺️ Roadmap
- [x] Phase 1 — Map + Pin dropping
- [x] Phase 2 — Firebase + Cloudinary image upload + Pin info cards
- [x] Phase 3 — Python AI backend with MobileNet dog detection
- [ ] Phase 4 — Dog recognition via embeddings

## 🐍 Running the AI Backend (Phase 3)

1. Navigate to the backend folder
```bash
   cd backend
```

2. Create and activate virtual environment
```bash
   python -m venv venv
   venv\Scripts\activate   # Windows
   source venv/bin/activate # Mac/Linux
```

3. Install dependencies
```bash
   pip install -r requirements.txt
```

4. Start the server
```bash
   uvicorn main:app --reload
```

5. API runs at `http://127.0.0.1:8000`
   - Docs available at `http://127.0.0.1:8000/docs`

## 👨‍💻 Author
Made with ❤️ by [DAVE AASHISTH](https://github.com/Taksui)

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
