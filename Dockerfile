# استخدم صورة Node الرسمية
FROM node:18

# تثبيت ffmpeg و yt-dlp و python
RUN apt-get update && \
    apt-get install -y ffmpeg python3-pip && \
    pip3 install yt-dlp

# نسخ ملفات المشروع
WORKDIR /app
COPY . .

# تثبيت الحزم
RUN npm install

# فتح المنفذ
EXPOSE 5000

# بدء السيرفر
CMD ["node", "server.js"]
