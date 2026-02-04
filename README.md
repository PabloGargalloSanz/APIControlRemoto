<div align="center">
  <h1>RemoteOps</h1>
  <h3>Monitorización y Control de Servidores en Tiempo Real</h3>

  <img width="510" height="580" alt="image" src="https://github.com/user-attachments/assets/82964363-786f-4eb0-b409-08ed3231ba07" />
  <p></p>

  <p>
    Una solución integral en contenedores para la gestión remota de servidores y visualización de hardware.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/Docker-Microservices-blue?style=flat-square&logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql" alt="Postgres" />
    <img src="https://img.shields.io/badge/Frontend-Nginx_%26_VanillaJS-green?style=flat-square&logo=nginx" alt="Nginx" />
    <img src="https://img.shields.io/badge/Security-Argon2_%26_JWT-red?style=flat-square&logo=security" alt="Security" />
  </p>
</div>

---

## Descripción

**RemoteOps** Es una aplicación web para entornos Linux basada en una API propia, capaz de obtener las estadísticas cada 10 segundos del hardware del ordenador o servidor en el que esta desplegada, proporciona una **terminal** para poder realizar tareas de mantenimiento y dispone de auditoria para poder tener un control exaustivo.

Está compuesto por diferentes microservicios gestionados con Docker, separando la lógica de la API, la interfaz, la base de datos y automatizaciones. 


---

## Características Principales

| Característica | Descripción |
| :--- | :--- |
| **Dashboard** | Visualización gráfica del estado del hardware: Información de CPU, RAM, almacenamiento y tráfico de red. |
| **Terminal** | Terminal integrada en el navegador que permite ejecutar comandos directamente en el Host. |
| **Auditoría de la sesión** | Registro detallado (Logs) de todas las acciones, comandos ejecutados y errores del sistema. |
| **Alertas y Métricas** | Detección automática de valores críticos y almacenamiento de métricas para análisis histórico. |
| **Automatización** | Contenedores con políticas de reinicio automático y jobs en segundo plano para mantenimiento de BD. |

---

## Stack Tecnológico

| Componente | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JS | Interfaz ligera servida mediante **Nginx**. |
| **Backend** | Node.js (Express) | API REST, Cron Jobs y gestión de **Websockets**. |
| **Base de Datos** | PostgreSQL 15 | Almacenamiento de usuarios, logs y métricas. |
| **Seguridad** | Argon2 & JWT | Hashing de contraseñas robusto y autenticación por tokens. |
| **Monitorización** | SystemInformation | Extracción de métricas de bajo nivel del Host. |

---

##  Estructura del Proyecto

```text
├── backend/
│   ├── src/
│   │   ├── controllers/   # Lógica de los endpoints (Auth, Shell, Metrics)
│   │   ├── db/            # Conexión y scripts SQL
│   │   ├── jobs.js        # Cron jobs para métricas y mantenimiento
│   │   ├── middlewares/   # Auth JWT, Logger de actividad y Manejo de errores
│   │   ├── routers/       # Definición de rutas API
│   │   ├── services/      # Lógica de negocio y consultas DB
│   │   └── workers/       # Procesamiento de métricas y alertas
│   ├── app.js             # Punto de entrada de la aplicación Express
│   └── Dockerfile         # Definición de imagen Node.js 
├── frontend/
│   ├── index.html         # Archivo html
│   ├── script.js          # Lógica de cliente y Fetch API
│   ├── styles.css         # Estilos 
│   └── nginx.conf         # Configuración de proxy inverso
├── docker-compose.yml     # Orquestación de servicios
└── .env                   # Variables de entorno

```
## Prerequisitos

- Docker y Docker Compose
- Entorno Linux

---

## Instalación y configuración

### 1. Clonar el repositorio ###
```
git clone https://github.com/tu-usuario/remote-ops.git
cd remote-ops
```

### 2. Confifurar variables de entorno ###

Crear el archivo .env en la raiz y rellenarlo con las variables del archivo .env.example.
```
  - PORT= Puerto en el que escucha el backend
  - DB_NAME= Nombre de la base de datos
  - DB_USER= Usuario de la base de datos
  - DB_HOST= Host de la base de datos
  - DB_PASSWORD= Contraseña de la base de datos
  - DB_PORT= Puerto de la base de datos, (PostgreSQL 5432)
  - AUTH_PEPPER= Un peper para crear el hash con argon2id
  - JWT_SECRET= Clave para firmar JWT
  - FIRST_PASS= Palabra clave para utilizar terminal
```

### 3. Instalar dependencias ###

Si se quiere seguir desarrollando hay que instalar dependencias con el comando.

````
npm install
````

En el caso de que solamente se quiere utilizar, no es necesario ya que en el dockerfile del backend ya esta el comando ```` npm install ```` para instalar las dependencias en el contenedor.
   
### 4. Despliegue con docker compose ###

El siguiente comando crea y levanta los contenedores.

```
docker-compose up -d --build
````

Se crearán cuatro contedores:
- remote_db: Base de datos PostgreSQL
- remote_api: Backend API
- remote_worker: Worker para recolección de métricas y limpieza de datos.
- remote_frontend: Servidor web Nginx

---
   
## Uso

### Acceso al sistema
Abrir un navegador y acceder a 
```` http://localhost:8080````

### Crear usuario

Por seguridad se ha desabilitado la creación de usuarios, para poder crear un usuario hay que acceder al archivo auth.routes.js y descomentar **router.post('/registrer', registrer);**

```text
├── backend/
│   ├── src/
│   │   ├── routers/ 
│   │       ├── auth.routes.js
```
Una vez descomentada esa línea, con una aplicación como insomnia se envia un paquete a la ruta ```` http://localhost:puerto-archivo.env/api/auth/register```` con el siguiente json.

```
{
	"email": "ejemplo",
	"password": "contrasena",
	"role": "admin"
}
```

No es necesario que sea un correo como por ejemplo example@gmail.com, con ser una combinación de carácteres UTF-8 es suficiente

Es importante hacerlo de esta manera y no introducir los datos directamente en la base de datos ya que la contraseña va cifraza con argon2id.

Una vez creado los usuarios pertinentes, recomiendo por seguridad volver a comentar la línea.


## Terminal

Para poder escribir comandos primero hay que introducir la palabra secreta en un cuadro de texto encima de la termina, si no es correcta o no está no se ejecutará el comando.

<img width="1625" height="309" alt="image" src="https://github.com/user-attachments/assets/90bf345a-238f-4405-ac57-32a30bdc9589" />

---

## Consideraciones 

El contedor remote_api se ejecuta con vólumenes y con **privileged: true**, por lo que tiene capacidad de **ROOT** del sistema que lo aloja.

---

## Imagenes

<img width="1913" height="897" alt="image" src="https://github.com/user-attachments/assets/92e00b9c-7c8f-4bac-b5c1-89bab47f41e7" />
<p></p>

<img width="1888" height="323" alt="image" src="https://github.com/user-attachments/assets/936ed6a3-fa87-4b41-bf7a-3af1e5df0408" />
<p></p>

<img width="1668" height="475" alt="image" src="https://github.com/user-attachments/assets/725584c8-4a96-4652-a0ee-145ff1cb38b6" />
<p></p>

<img width="1690" height="251" alt="image" src="https://github.com/user-attachments/assets/e8a24e65-92c8-4498-8eec-7d95b1726cd0" />







