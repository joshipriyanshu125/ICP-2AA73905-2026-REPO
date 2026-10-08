# Week 4: Weather Dashboard Application

## Intern Career Path — Web Development
**Portal ID:** `ICP-2AA73905-2026`  
**Repository:** ICP-2AA73905-2026-REPO  
**Internship Week:** Week 4  
**Project:** Weather Dashboard Application (Project 2)

---

## 📋 Overview

Week 4 focuses on **external API integration**, **asynchronous data fetching**, and **data visualization** using the **MERN stack**. Building on the core functionality from Week 2 (Task Management Application), this week transitions from local state management to real-world external HTTP data handling via the OpenWeatherMap API.

The Weather Dashboard Application provides users with quick access to real-time weather forecasts and visual climate data for daily planning.

---

## 🎯 Objectives & Deliverables

| Target Task | Status | Implementation Details |
| :--- | :---: | :--- |
| **OpenWeatherMap API Integration** | ⚡ In Progress | Fetch current weather and 5-day forecast data |
| **Geolocation API** | ⚡ In Progress | Integrate Browser Geolocation API for automatic location-based weather |
| **Current Weather Card** | ⚡ In Progress | Display temperature, humidity, wind speed, and condition icons |
| **5-Day Forecast Grid** | ⚡ In Progress | Show daily forecast cards with high/low temperatures |
| **City Search Form** | ⚡ In Progress | Allow users to search for any city worldwide |
| **Error Handling & Resilience** | ⚡ In Progress | Handle 404 city errors, invalid API keys, network failures |
| **Data Visualization Charts** | ⚡ Planned | Dynamic temperature trend chart using Chart.js |
| **Production Deployment** | ⚡ Planned | Deploy to Vercel with custom domain |
| **Full Documentation** | ⚡ Planned | Comprehensive technical documentation and deployment guide |

---

## 🏗️ Project Structure

```
Week4/
├── README.md                 # Week 4 syllabus, focus areas, and milestone summary
├── documentation.md          # Full technical documentation
├── deployment-guide.md       # Deployment instructions (Vercel + Render)
├── .gitignore                # Git ignore rules
└── Weather Application/      # Project 2 root (mirrors Week2/Task Management)
    ├── backend/              # MERN Backend Implementation
    │   ├── package.json      # Dependencies and execution scripts
    │   ├── .env              # Environment variables (PORT, MONGODB_URI, WEATHER_API_KEY)
    │   ├── README.md         # Backend API reference
    │   ├── src/
    │   │   ├── server.js             # Application entry point
    │   │   ├── config/db.js          # Mongoose connection
    │   │   ├── models/               # SearchHistory.js, FavoriteCity.js
    │   │   ├── routes/weather.js     # REST API routes
    │   │   ├── controllers/weatherController.js  # Request handlers
    │   │   ├── services/weatherService.js        # OpenWeatherMap API client
    │   │   └── middleware/           # errorHandler.js, rateLimiter.js
    │   └── tests/                    # Integration test suite (6/6 passing)
    └── frontend/             # React + Vite Frontend
        ├── package.json      # Frontend dependencies
        ├── vite.config.js    # Vite build config + /api dev proxy
        ├── index.html        # HTML template
        ├── README.md         # Frontend component map
        ├── public/favicon.svg
        └── src/
            ├── main.jsx      # React root entry point
            ├── App.jsx       # Root component: state & orchestration
            ├── api.js        # Centralized API client
            ├── index.css     # Global styles with design tokens
            ├── hooks/useGeolocation.js  # Geolocation + unit helpers
            └── components/
                ├── CurrentWeatherCard.jsx   # Current weather display
                ├── SearchForm.jsx           # City search + history chips
                ├── FiveDayForecast.jsx      # 5-day forecast grid
                ├── GeolocationBadge.jsx     # Location badge
                └── FavoritesBar.jsx         # Favorite cities bar
```

---

## 🆕 New This Week: Key Concepts

### 1. External REST API Integration
- Fetching data from third-party services (OpenWeatherMap)
- API key management and security
- Rate limiting and error handling
- JSON parsing and data transformation

### 2. Asynchronous JavaScript
- `async`/`await` pattern for network requests
- Error boundaries for failed API calls
- Loading and error states in UI

### 3. Browser Geolocation API
- Accessing user's current location with permission
- Fallback when location services are disabled
- Combining geolocation with city search

### 4. Data Visualization
- Displaying multi-day forecast data
- Temperature unit toggles (Celsius/Fahrenheit)
- Weather condition icons and descriptions

### 5. LocalStorage Persistence
- Caching recent city searches
- Preserving user preferences between sessions
- Offline state management

---

## 📚 Reference Documentation

| Document | Description | Reference |
| :--- | :--- | :--- |
| [`Week2/documentation.md`](../Week2/documentation.md) | Week 2 core functionality and architectural patterns | Task Management Application |
| [`Week2/backend-architecture.md`](../Week2/backend-architecture.md) | Modular monolith architecture and API design | Task Management Backend |
| [`Week3/documentation.md`](../Week3/documentation.md) | Full technical journal and event pipeline architecture | TaskFlow Project |
| [`Week3/deployment-guide.md`](../Week3/deployment-guide.md) | Production deployment guide (Vercel/Render/Railway) | TaskFlow Deployment |
| [`Week1/project-selection.md`](../Week1/project-selection.md) | Original project selection rationale and milestones | Week 1 Planning |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarn.dev/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- OpenWeatherMap API key

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git
cd ICP-2AA73905-2026-REPO/Week4
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd "Weather Application/backend"

# Install NPM dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and fill in your values
cp .env.example .env

# Your .env should contain:
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/weather_dashboard
# WEATHER_API_KEY=your_openweathermap_api_key
# CLIENT_ORIGIN=http://localhost:5173

# Launch development server
npm run dev

# Server outputs: Weather API listening on http://localhost:5000
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd "Weather Application/frontend"

# Install NPM dependencies
npm install

# Launch development server
npm run dev

# Vite outputs: Local: http://localhost:5173
```

#### 4. Full Application

```bash
# From the Week4 root directory, start both servers
# Terminal 1:
cd "Weather Application/backend" && npm run dev

# Terminal 2:
cd "Weather Application/frontend" && npm run dev

# Open your browser at http://localhost:5173
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Fetch API, CSS Modules / Design Tokens, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express 5, Mongoose ODM |
| **Database** | MongoDB (Mongoose ODM) - stores city search history, user preferences |
| **API** | OpenWeatherMap API (Current Weather, 5-Day Forecast) |
| **Build Tool** | Vite 6 for lightning-fast frontend development |
| **Environment** | dotenv for secure environment variable management |

---

## 📅 Week 4 Milestone Roadmap

| Week | Focus | Key Deliverables |
| :--- | :--- | :--- |
| **Week 4** | **API Integration & Core UI** | OpenWeatherMap API integration, current weather card, city search, basic forecast |
| **Week 5** | **Geolocation & Forecast Enhancement** | Browser geolocation, 5-day forecast display, error handling, resilience patterns |
| **Week 6** | **Charts & Production Release** | Chart.js temperature trends, Celsius/Fahrenheit toggle, favorite cities storage, deployment |

---

## 📬 Contact & Support

- **Repository:** [ICP-2AA73905-2026-REPO](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
- **Portal ID:** `ICP-2AA73905-2026`
- **Internship Track:** Web Development Self-Learning Program
- **Module:** Week 4 — External API Integration & Data Visualization

