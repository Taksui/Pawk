# 🐾 Pawk

> Pawk is a real-time street dog mapping platform designed to help identify, track, and respond to injured or vulnerable dogs in urban environments.

> By combining crowdsourced reports with AI-based image recognition, the platform enables users to detect, match, and monitor individual street dogs across locations.


## 🌍 Live Demo
Currently optimized for local demo. Deployment in progress.

## ✨ Key Highlights

- 📍 **Interactive map-based reporting** — Drop pins to log street dog sightings
- 🐶 **AI-powered dog detection** — Verifies uploaded images before saving
- 🧠 **Dog re-identification** — Matches sightings using embedding-based recognition
- 🔄 **Live data integration** — Pulls external sightings (iNaturalist + Reddit)
- 🌡️ **Heatmap visualization** — Identifies high-density dog zones
- 👤 **User system** — Google Auth + user profiles

## 🚀 Features

- 🗺️ Google Maps integration with real-time markers  
- 📸 Image upload with Cloudinary storage  
- 🤖 Backend AI pipeline for detection + recognition  
- 🔥 Firebase for real-time database and sync  
- 🧭 External data ingestion pipeline (Python backend)  
- 📊 Dynamic UI with heatmaps and analytics overlays  

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Maps | Google Maps JavaScript API |
| Backend | Firebase (Firestore, Auth) |
| AI | Python (FastAPI), MobileNet, Embedding-based Recognition |
| Storage | Cloudinary |

## 📁 Project Structure
src/
├── components/     # Reusable UI components
├── pages/          # App pages
├── hooks/          # Custom React hooks
├── services/       # Firebase & API logic
├── assets/         # Images and icons
└── styles/         # CSS files

## 🌱 Why This Matters

Street dogs in urban environments often go unnoticed when injured or in distress.

Pawk aims to:
- Enable faster, community-driven reporting
- Track repeat sightings of the same dog across locations
- Provide data-backed insights into high-density areas
- Support more structured and scalable rescue efforts

## ⚙️ Setup Instructions

1. Clone the repo
```bash
   git clone https://github.com/YOUR_USERNAME/pawk.git
   cd pawk
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

## 🐍 Running the AI Backend

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

