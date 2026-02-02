FROM nginx:alpine

# copiamos HTML/JS/CSS a la carpeta publica de nginx
COPY . /usr/share/nginx/html

# copiamos config personal
COPY nginx.conf /etc/nginx/conf.d/default.conf

# abierto puerto 80
EXPOSE 80

# encender Nginx
CMD ["nginx", "-g", "daemon off;"]