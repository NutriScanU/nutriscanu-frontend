# Paso 1: Construir la imagen con Node.js
FROM node:18-alpine as build

# Definir el directorio de trabajo
WORKDIR /app

# Copiar los archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar todo el código fuente al contenedor
COPY . .

# Construir el proyecto React
RUN npm run build

# Paso 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Copiar los archivos construidos desde el contenedor anterior
COPY --from=build /app/build /usr/share/nginx/html

# ⚠️ Copiar el archivo de configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto en el que correrá la aplicación
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
