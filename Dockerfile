# ใช้ Node.js เวอร์ชัน 18
FROM node:18

# สร้างและกำหนดงานใน /app
WORKDIR /app

# คัดลอก package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์ทั้งหมดที่เหลือ
COPY . .

# เปิดพอร์ต 5000 สำหรับ backend API
EXPOSE 5000

# รัน server เมื่อ container เริ่มต้น
CMD ["npm", "start"]