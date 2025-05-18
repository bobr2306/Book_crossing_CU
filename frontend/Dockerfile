FROM node:20

WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости и явно устанавливаем vite
RUN npm install && \
    npm install vite @vitejs/plugin-react --save-dev

# Копируем остальные файлы проекта
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]