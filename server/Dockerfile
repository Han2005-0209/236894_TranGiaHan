# Dockerfile cho Backend Node.js/Express
FROM node:20-alpine

WORKDIR /app

# Sao chép package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Sao chép toàn bộ mã nguồn backend
COPY . .

# Khai báo cổng
EXPOSE 5000

# Biến môi trường mặc định
ENV NODE_ENV=production
ENV PORT=5000

# Lệnh khởi chạy
CMD ["node", "server.js"]
