# Sử dụng Node.js lightweight image
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file package để cài dependencies trước (tối ưu cache)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build ứng dụng NestJS (tạo thư mục dist)
RUN npm run build

# Mở port 3001 (khớp với code main.ts của bạn)
EXPOSE 3001

# Lệnh chạy ứng dụng production
CMD ["node", "dist/main.js"]