# 🔍 Cybersecurity Log Analyzer

A modern, AI-powered web application for analyzing web server logs and detecting security threats. Built with Next.js, Flask, and sophisticated anomaly detection algorithms.

## 🚀 Features

- **Modern Web Interface**: Responsive React/Next.js frontend with beautiful UI
- **AI-Powered Threat Detection**: Advanced algorithms for detecting DDoS attacks, rare paths, and error spikes
- **Real-time Analysis**: Upload and analyze log files instantly
- **RESTful API**: Clean API endpoints for all operations
- **File Upload Support**: Handles .log, .txt, and .csv files
- **Multiple Log Formats**: Supports combined and Zscaler log formats

## 🏗️ Architecture

```
Frontend (Next.js/TypeScript) ←→ Backend (Flask/Python) ←→ AI Threat Detection Engine
                                      ↓
                              File Storage (uploads/)
```

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.11+
- Git

## 🛠️ Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/asaini27/Full-Stack-Cybersecurity-Application.git
cd Full-Stack-Cybersecurity-Application
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

#### Install Dependencies
```bash
cd log-analyzer/backend
pip install -r requirements.txt
```

#### Configure Environment (Optional)
```bash
# Create .env file for custom settings
cat > .env << EOF
APP_USERNAME=admin
APP_PASSWORD=password
BURST_THRESHOLD=100
RARE_MIN_SUPPORT=2
UPLOAD_DIR=./uploads
LOG_FORMAT=combined
EOF
```

#### Start Backend Server
```bash
python app.py
```
The backend will start on `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd log-analyzer/frontend
npm install
```

#### Start Frontend Server
```bash
npm run dev
```
The frontend will start on `http://localhost:3000`

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Default Credentials**: 
  - Username: `admin`
  - Password: `password`

## 🤖 AI Threat Detection Model

The application uses **rule-based AI algorithms** for sophisticated threat detection. The AI system implements four main detection algorithms:

### 1. Burst Detection Algorithm
- **Purpose**: Identifies potential DDoS attacks and brute force attempts
- **Method**: Sliding window analysis over 60-second intervals
- **Algorithm**: 
  - Maintains a deque for each IP address
  - Tracks requests within 60-second windows
  - Flags IPs exceeding configurable threshold (default: 100 requests)
  - Calculates confidence score based on burst intensity
- **Confidence Calculation**: `min(0.99, 0.5 + (count - threshold) / (threshold * 2))`

### 2. Rare Path Detection Algorithm
- **Purpose**: Identifies unusual or suspicious request patterns
- **Method**: Frequency analysis of request paths
- **Algorithm**:
  - Counts occurrences of each unique path
  - Flags paths with minimal support (default: ≤2 occurrences)
  - Assigns higher confidence to single-occurrence paths
- **Confidence Calculation**: 0.5 for threshold occurrences, 0.8 for single occurrences

### 3. Error Spike Detection Algorithm
- **Purpose**: Identifies potential attacks causing server errors
- **Method**: Statistical analysis of error rates
- **Algorithm**:
  - Calculates global 5xx error rate
  - Tracks per-IP error counts
  - Flags global spikes >10% error rate
  - Identifies IPs with ≥5 errors when global rate >5%
- **Confidence Calculation**: `min(0.99, 0.6 + error_rate)` for global spikes

### 4. Timeline Analysis
- **Purpose**: Provides temporal analysis for pattern recognition
- **Method**: Groups requests by minute intervals
- **Features**:
  - Request count per minute
  - Top IPs and paths per interval
  - Error tracking over time

### AI Decision Making Process

1. **Input Processing**: Raw log files are parsed into structured data
2. **Statistical Preprocessing**: Calculates global metrics and distributions
3. **Threat Classification**: Classifies threats into four categories
4. **Confidence Scoring**: Provides 0.0 to 0.99 confidence scores
5. **Result Presentation**: Returns detailed explanations for each threat

## 📊 Example Log Files for Testing

### 1. Sample Access Log (access_sample.log)
```
192.168.1.100 - - [24/Sep/2024 10:00:01 +0000] "GET /index.html HTTP/1.1" 200 1024
192.168.1.101 - - [24/Sep/2024 10:00:02 +0000] "GET /about.html HTTP/1.1" 200 2048
192.168.1.100 - - [24/Sep/2024 10:00:03 +0000] "GET /contact.html HTTP/1.1" 200 1536
192.168.1.102 - - [24/Sep/2024 10:00:04 +0000] "POST /login HTTP/1.1" 401 512
192.168.1.100 - - [24/Sep/2024 10:00:05 +0000] "GET /admin/config.php HTTP/1.1" 404 256
192.168.1.100 - - [24/Sep/2024 10:00:06 +0000] "GET /admin/config.php HTTP/1.1" 404 256
192.168.1.100 - - [24/Sep/2024 10:00:07 +0000] "GET /admin/config.php HTTP/1.1" 404 256
192.168.1.103 - - [24/Sep/2024 10:00:08 +0000] "GET /products.html HTTP/1.1" 200 3072
192.168.1.100 - - [24/Sep/2024 10:00:09 +0000] "GET /admin/config.php HTTP/1.1" 404 256
192.168.1.100 - - [24/Sep/2024 10:00:10 +0000] "GET /admin/config.php HTTP/1.1" 404 256
```

### 2. Burst logs (bursty.log)
```
203.0.113.9 - - [10/Oct/2000:13:55:00 -0700] "GET /home HTTP/1.1" 200 256 "-" "Mozilla/5.0"
203.0.113.9 - - [10/Oct/2000:13:55:02 -0700] "GET /home HTTP/1.1" 200 256 "-" "Mozilla/5.0"
203.0.113.9 - - [10/Oct/2000:13:55:04 -0700] "GET /home HTTP/1.1" 200 256 "-" "Mozilla/5.0"
203.0.113.9 - - [10/Oct/2000:13:55:06 -0700] "GET /home HTTP/1.1" 200 256 "-" "Mozilla/5.0"
203.0.113.9 - - [10/Oct/2000:13:55:08 -0700] "GET /home HTTP/1.1" 200 256 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:10 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:10 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:11 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:11 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:12 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:12 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:13 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:13 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:14 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
198.51.100.42 - - [10/Oct/2000:13:55:14 -0700] "GET /login HTTP/1.1" 200 128 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:00 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:01 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:02 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:03 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:04 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:05 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:06 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:07 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:08 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
192.0.2.55 - - [10/Oct/2000:14:00:09 -0700] "GET /admin HTTP/1.1" 500 0 "-" "Mozilla/5.0"
```

## 🧪 Testing the Application

### 1. Test with Sample Logs
1. Start both backend and frontend servers
2. Open http://localhost:3000
3. Login with `admin` / `password`
4. Upload one of the sample log files above
5. Observe the AI threat detection results

### 2. Expected Results

**DDoS Sample**: Should detect `BURST_IP` anomaly with high confidence
**Error Spike Sample**: Should detect `GLOBAL_ERROR_SPIKE` and `IP_ERROR_SPIKE`
**Access Sample**: Should detect `RARE_PATH` for `/admin/config.php`
**Clean Sample**: Should show "No threats detected"

### 3. API Testing
```bash
# Test login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Test file upload
curl -X POST http://localhost:8000/api/upload \
  -H "Authorization: Basic admin:password" \
  -F "file=@access_sample.log"

# Test health check
curl http://localhost:8000/api/ping
```

## 🔧 Configuration

### Environment Variables
- `APP_USERNAME`: Admin username (default: admin)
- `APP_PASSWORD`: Admin password (default: password)
- `BURST_THRESHOLD`: Requests per 60s to trigger burst detection (default: 100)
- `RARE_MIN_SUPPORT`: Minimum occurrences for path to be normal (default: 2)
- `UPLOAD_DIR`: Directory for uploaded files (default: ./uploads)
- `LOG_FORMAT`: Log format to parse (combined | zscaler)

### AI Algorithm Tuning
Adjust the detection sensitivity by modifying:
- `BURST_THRESHOLD`: Lower = more sensitive to bursts
- `RARE_MIN_SUPPORT`: Lower = more sensitive to rare paths
- Error rate thresholds in `anomalies.py`

## 📡 API Endpoints

- `POST /api/login` - User authentication
- `POST /api/upload` - Upload and analyze log files
- `GET /api/ping` - Health check

## 🔒 Security Features

- Basic authentication for API access
- File type validation for uploads
- Input sanitization and validation
- CORS configuration for development
- Error handling without information leakage




