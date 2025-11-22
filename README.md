# Personal Funds Management Application

A full-stack application for managing personal funds with deposit tracking, interest calculation (4% monthly), and withdrawal management with a 90-day lock period.

## Features

### Admin Features
- Create user accounts
- View all users
- Approve/reject deposit requests
- View all deposits with status

### User Features
- Submit deposit requests with proof
- View current balance with accrued interest
- Track deposit maturity (90-day lock period)
- Withdraw interest or full amount after maturity
- View transaction history

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios

## Business Rules

1. **Interest Calculation**: Simple interest at 4% of principal per month (12% total after 90 days)
2. **One Deposit Per User**: Users can only have one deposit request at a time (pending or active)
3. **90-Day Lock Period**: Withdrawals are only available after 90 days from deposit approval
4. **Withdrawal Options**:
   - Withdraw interest only (deposit remains active with new 90-day period)
   - Withdraw full amount (principal + interest, closes deposit)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- MongoDB (local or MongoDB Atlas)

### MongoDB Setup

#### Option 1: Local MongoDB
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify MongoDB is running
mongosh
```

#### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/funds_management?retryWrites=true&w=majority
   ```

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# The .env file is already configured with default settings
# Update if needed (especially MongoDB URI and JWT secret)

# Start the server
python main.py
```

The backend will be available at `http://localhost:8000`

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Change these in production!**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
project inv/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── database.py             # MongoDB connection
│   ├── requirements.txt        # Python dependencies
│   ├── models/                 # Pydantic models
│   │   ├── user.py
│   │   ├── deposit.py
│   │   └── transaction.py
│   ├── routes/                 # API routes
│   │   ├── auth.py
│   │   ├── admin.py
│   │   └── user.py
│   └── utils/                  # Utility functions
│       ├── auth.py             # Authentication & JWT
│       └── interest.py         # Interest calculations
└── frontend/
    ├── src/
    │   ├── pages/              # Page components
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   └── UserDashboard.jsx
    │   ├── components/         # Reusable components
    │   │   └── ProtectedRoute.jsx
    │   ├── context/            # React context
    │   │   └── AuthContext.jsx
    │   ├── services/           # API services
    │   │   └── api.js
    │   ├── App.jsx             # Main app component
    │   └── main.jsx            # Entry point
    ├── index.html
    ├── tailwind.config.js      # Tailwind configuration
    └── package.json
```

## Usage Guide

### Admin Workflow

1. **Login** with admin credentials
2. **Create Users**: Go to "Create User" tab and add new user accounts
3. **Review Deposits**: Check "Deposit Requests" tab for pending deposits
4. **Approve/Reject**: Review proof documents and approve or reject deposits
5. **Monitor Users**: View all users in "View Users" tab

### User Workflow

1. **Login** with user credentials
2. **Submit Deposit**: Fill out the deposit form with amount and proof URL
3. **Wait for Approval**: Admin will review and approve/reject
4. **Track Progress**: View balance and days remaining until maturity
5. **Withdraw**: After 90 days, choose to withdraw interest or full amount

## Development

### Backend Development
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production

#### Backend
```bash
cd backend
pip install -r requirements.txt
# Update .env with production settings
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with a static file server
```

## Security Notes

⚠️ **Important for Production:**
1. Change the default admin password
2. Update `JWT_SECRET_KEY` in `.env` to a strong random string
3. Use HTTPS for all communications
4. Set up proper CORS origins
5. Use environment variables for sensitive data
6. Enable MongoDB authentication
7. Implement rate limiting
8. Add input validation and sanitization

## License

This project is for educational/demonstration purposes.
