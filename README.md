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
- **Cơ sở dữ liệu:** MongoDB Atlas (Database: \236894_TranGiaHan\, Collection: \oods\)
- **Containerization:** Docker, Docker Compose, Nginx
- **Container Registry:** Docker Hub (\	rangiahan2005/backend\, \	rangiahan2005/frontend\)
- **Cloud Deployment:** Render (Web Service Backend & Frontend)

---

## 2. Cấu trúc thư mục

\\\	ext
236894_TranGiaHan/
├── .gitignore
├── README.md
├── docker-compose.yml
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
\\\

---

## 3. Hướng dẫn cài đặt và chạy chương trình

### Yêu cầu môi trường
- Node.js >= 18
- Docker Desktop & Docker Compose
- Tài khoản MongoDB Atlas

### Chạy trực tiếp (Local Development)

1. **Khởi chạy Backend:**
   \\\ash
   cd server
   npm install
   # Tạo file .env với cổng và chuỗi kết nối MongoDB Atlas
   npm start
   \\\
   Backend chạy tại: \http://localhost:5000\

2. **Khởi chạy Frontend:**
   \\\ash
   cd client
   npm install
   npm run dev
   \\\
   Frontend chạy tại: \http://localhost:5173\

---

## 4. Bảng thông tin nộp bài

| Trường thông tin | Nội dung cung cấp |
|---|---|
| **Link_GitHub** | https://github.com/Han2005-0209/236894_TranGiaHan |
| **Link_Docker_Backend** | https://hub.docker.com/r/trangiahan2005/backend |
| **Link_Docker_Frontend** | https://hub.docker.com/r/trangiahan2005/frontend |
| **Link_Render_App** | Sẽ cập nhật sau khi hoàn thành triển khai |
| **Link_Render_API** | Sẽ cập nhật sau khi hoàn thành triển khai |
| **Link_Data_MongoDB** | Database: 236894_TranGiaHan, Collection: foods |
