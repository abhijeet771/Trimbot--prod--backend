# Trim Tokyo AI Chatbot System ✂️🤖

A complete, production-grade, standalone AI Salon Assistant designed for **Trim Tokyo**. The system operates independently from the main salon website, communicating via REST APIs and WebSockets, facilitating easy embed integration into any front-end.

---

## 🏗️ Clean Architecture Flow

```
User Input ➔ Express Controller ➔ Business Logic Service ➔ DAO Repository ➔ Mongoose DB
                  │
                  ▼
          AI Provider (GPT/Gemini/Claude)
                  │
                  ▼
         Recursive Tool Loop (Check Availability, Book, Recommend)
```

---

## 📦 Integration into Official Trim Tokyo Website

The chatbot is exported as a single, self-contained React component: `<TrimTokyoChatbot />`.

```tsx
import TrimTokyoChatbot from "./components/TrimTokyoChatbot";

function App() {
  return (
    <>
      <ExistingTrimTokyoWebsite />
      <TrimTokyoChatbot />
    </>
  );
}
```

The chatbot renders as a floating action widget in the bottom-right corner (similar to Intercom or Tidio), managing its own state, WebSockets/REST connections, and drawer components.

---

## 🚀 Installation & Local Startup

Follow these steps to get the environment running locally:

### 1. Prerequisite Installations
- Install **Node.js** (v18 or higher)
- Install **MongoDB** locally (default path: `mongodb://127.0.0.1:27017/trimtokyo`) OR have a MongoDB Atlas connection string.

### 2. Install Project Dependencies
In the root directory of the project, run:
```bash
npm install
```
This leverages npm workspaces to resolve and install dependencies for both the frontend `client` and backend `server` folders concurrently.

### 3. Setup Environment Variables
Configure the `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/trimtokyo
JWT_SECRET=super_secret_session_token_trim_tokyo_98765

# AI Configuration (Options: openai | gemini | claude | deepseek)
AI_PROVIDER=openai
AI_MODEL_NAME=gpt-4o
OPENAI_API_KEY=your_key_here
```

### 4. Seed Database Models
Populate the database with services, barbers, schedules, pricing rules, and styles:
```bash
npx ts-node -O "{\"module\": \"commonjs\"}" scripts/seed.ts
```

### 5. Start Development Servers
Start both the backend server and Vite frontend compiler from the root using:
- **Run Backend**: `npm run dev:server` (Starts Express at `http://localhost:5000`)
- **Run Frontend**: `npm run dev:client` (Starts Vite at `http://localhost:5173`)

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Payload Schema |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/chat` | Submit conversational message | `{ sessionId: string, messageText: string, userId?: string }` |
| **POST** | `/api/book` | Manually book a slot | `{ userId: string, barberId: string, serviceIds: string[], date: ISO8601 }` |
| **POST** | `/api/cancel` | Cancel booking | `{ appointmentId: string }` |
| **POST** | `/api/reschedule`| Modify date/time slot | `{ appointmentId: string, newDate: ISO8601 }` |
| **GET** | `/api/barbers` | Retrieve list of active barbers | Optional: `?specialty=fade&date=YYYY-MM-DD` |
| **GET** | `/api/pricing` | Lookup prices and durations | Optional: `?serviceName=cut&tier=student` |
| **GET** | `/api/health` | Ping server health metrics | None |

---

## ⚡ Socket.io Event Layer

- **`chat_message`** (Sent by Client): Delivers text entries. Triggers typing displays and tool processing.
- **`assistant_message`** (Sent by Server): Emits final textual and tool returns.
- **`typing`** (Bidirectional): Broadcasts active typing state.
- **`stop_typing`** (Bidirectional): Signals end of input focus.
- **`booking_updated`** (Sent by Server): Syncs booking slots real-time.

---

## 🐳 Docker Deployment

To launch the system (MongoDB + Backend Server + Frontend Client) concurrently inside container structures:
```bash
docker-compose up --build
```
- Client is serving at `http://localhost:5173`
- Backend API at `http://localhost:5000`
- MongoDB local listener running on port `27017`
