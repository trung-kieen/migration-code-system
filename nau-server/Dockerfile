FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Cài đặt dependencies
RUN npm install

COPY . .

# Vì package.json của bạn chưa có script "build", 
# tôi sẽ dùng npx tsc để compile TypeScript dựa trên tsconfig.json có sẵn
RUN npx tsc

# Mở port 3002 (khớp với code index.ts của bạn)
EXPOSE 3002

# Chạy file đã compile trong thư mục dist
CMD ["node", "dist/index.js"]