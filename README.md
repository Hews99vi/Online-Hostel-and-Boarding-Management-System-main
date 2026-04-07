
## 🏨 LuxeStay - Hotel Booking & Management System

A full-stack hotel room booking and management system with real-time chat, payment integration, and admin dashboard.

## 📋 Features

### User Features

- 🔐 User authentication (Login/Signup)
- 🏠 Browse and search available rooms
- 📅 Room booking with date selection
- 💳 Secure payment processing with Stripe
- 💬 Real-time chat with admin support
- 📊 View booking history
- 👤 User profile management
- ⭐ Rate rooms and leave reviews

### Admin Features

- 📈 Analytics and reports dashboard
- 🛏️ Room management (Create, Edit, Delete)
- 📋 Booking management
- 👥 User management
- 💬 Real-time chat with customers
- 💰 Payment tracking

### Technical Features

- ⚡ Real-time communication using Socket.IO
- 🔒 JWT-based authentication
- 📸 Image uploads with Cloudinary
- 💳 Payment processing with Stripe
- 📱 Responsive design with Tailwind CSS
- 🎨 Smooth animations with Framer Motion

## 🛠️ Tech Stack

### Frontend

- React.js
- React Router DOM
- Tailwind CSS
- Framer Motion
- Socket.IO Client
- Axios
- Zustand (State Management)
- Stripe React Components

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- Bcrypt.js
- Stripe API
- Cloudinary

## 📁 Project Structure

```
coursework-full-stack-group-19/
├── backend/
│   ├── controllers/      # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── lib/             # Utilities (DB, Socket, Cloudinary)
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # API clients
│   │   └── store/       # State management
│   └── public/
└── package.json         # Root package file
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Stripe Account
- Cloudinary Account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd coursework-full-stack-group-19
```

### 2. Install Dependencies

#### Install all dependencies at once (Recommended):

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

#### Or install from root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3. Running the Application

#### Option 1: Run Both Frontend and Backend Together (Recommended)

```bash
npm run dev
```

This will start:

- Backend server on `http://localhost:5000`
- Frontend server on `http://localhost:3000`

#### Option 2: Run Separately

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

### 4. Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd ../backend
npm start
```

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Rooms

- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room (Admin)
- `PUT /api/rooms/:id` - Update room (Admin)
- `DELETE /api/rooms/:id` - Delete room (Admin)

### Bookings

- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Payments

- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `GET /api/payments/history` - Get payment history

### Chat

- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/messages/:conversationId` - Get messages
- `POST /api/chat/messages` - Send message

### Reviews & Ratings

- `GET /api/reviews/random` - Get random user reviews (optional `limit` query)
- `GET /api/reviews/room/:roomId` - Get reviews for a room
- `POST /api/reviews/room/:roomId` - Create a review (Auth)
- `PUT /api/reviews/:reviewId` - Update a review (Auth, owner/admin)
- `DELETE /api/reviews/:reviewId` - Delete a review (Auth, owner/admin)

### Reports (Admin)

- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/bookings` - Get booking reports
- `GET /api/reports/revenue` - Get revenue reports

## 📄 License

This project is part of PUSL3120 assessment.

## 👥 Authors

Group 19

## 🙏 Acknowledgments

- PUSL3120 Course Team
- Open source libraries and their contributors
