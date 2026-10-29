# Hệ thống quản lý món ăn trên nền tảng đám mây

**Học phần:** Điện toán đám mây
**Sinh viên thực hiện:** Trần Gia Hân
**Mã sinh viên:** 236894
**Lớp:** DH23TIN08
**Repository GitHub:** [236894_TranGiaHan](https://github.com/Han2005-0209/236894_TranGiaHan)

---

## 1. Giới thiệu đề tài & Công nghệ

Ứng dụng quản lý món ăn gồm frontend React, backend Node.js/Express REST API và cơ sở dữ liệu đám mây MongoDB Atlas. Ứng dụng được đóng gói container bằng Docker, xuất bản image lên Docker Hub và triển khai dịch vụ đám mây trên nền tảng Render.

- **Frontend:** React (Vite), Axios, CSS
- **Backend:** Node.js, Express, Mongoose, CORS, dotenv
- **Cơ sở dữ liệu:** MongoDB Atlas (Database: `236894_TranGiaHan`, Collection: `foods`)
- **Containerization:** Docker, Docker Compose, Nginx
- **Container Registry:** Docker Hub (`trangiahan2005/backend`, `trangiahan2005/frontend`)
- **Cloud Deployment:** Render (Web Service Backend & Frontend)

---

## 2. Cấu trúc thư mục

```text
236894_TranGiaHan/
├── .gitignore
├── README.md
├── docker-compose.yml
├── render.yaml
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── App.css
└── server/
    ├── package.json
    ├── server.js
    ├── Dockerfile
    ├── .dockerignore
    ├── config/
    │   └── db.js
    ├── models/
    │   └── Food.js
    ├── routes/
    │   └── foodRoutes.js
    └── seed.js
```

---

## 3. Hướng dẫn cài đặt và chạy chương trình

### Yêu cầu môi trường
- Node.js >= 18
- Docker Desktop & Docker Compose
- Tài khoản MongoDB Atlas

### Chạy trực tiếp (Local Development)

1. **Khởi chạy Backend:**
   ```bash
   cd server
   npm install
   npm start
   ```
   Backend chạy tại: `http://localhost:5000`

2. **Khởi chạy Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Frontend chạy tại: `http://localhost:5173`

### Chạy Backend bằng Docker

1. **Kéo image từ Docker Hub:**
   ```bash
   docker pull trangiahan2005/backend:latest
   ```

2. **Chạy container backend:**
   ```bash
   docker run -d --name food-backend -p 5000:5000 \
     -e PORT=5000 \
     -e MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.7q3oxm1.mongodb.net/?retryWrites=true&w=majority" \
     -e MONGODB_DB_NAME="236894_TranGiaHan" \
     trangiahan2005/backend:latest
   ```
   Kiểm tra trạng thái tại: `http://localhost:5000/health`

### Chạy Frontend bằng Docker

1. **Kéo image từ Docker Hub:**
   ```bash
   docker pull trangiahan2005/frontend:latest
   ```

2. **Chạy container frontend:**
   ```bash
   docker run -d --name food-frontend -p 80:80 trangiahan2005/frontend:latest
   ```
   Truy cập giao diện tại: `http://localhost:80`

### Chạy toàn bộ hệ thống bằng Docker Compose

```bash
docker compose up -d
```

### Triển khai trên nền tảng đám mây Render

Dự án hỗ trợ Render Blueprint (`render.yaml`). Khi liên kết repository với Render:
1. **Frontend Web Service:** Dịch vụ `web-236894` triển khai Static Site từ thư mục `client/` với URL công khai:
   `https://web-236894.onrender.com`
2. **Backend API Service:** Dịch vụ `api-236894` triển khai Web Service Node.js từ thư mục `server/` với URL công khai:
   `https://api-236894.onrender.com`
   - Endpoint kiểm tra sức khỏe: `https://api-236894.onrender.com/health`
   - Endpoint danh sách món ăn: `https://api-236894.onrender.com/api/foods`

---

## 4. Bảng thông tin nộp bài

| Trường thông tin | Nội dung cung cấp |
|---|---|
| **Link_GitHub** | https://github.com/Han2005-0209/236894_TranGiaHan |
| **Link_Docker_Backend** | https://hub.docker.com/r/trangiahan2005/backend |
| **Link_Docker_Frontend** | https://hub.docker.com/r/trangiahan2005/frontend |
| **Link_Render_App** | https://web-236894.onrender.com |
| **Link_Render_API** | https://api-236894.onrender.com |
| **Link_Data_MongoDB** | Database: 236894_TranGiaHan, Collection: foods |
