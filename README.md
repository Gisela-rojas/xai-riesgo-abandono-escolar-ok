# Sistema XAI para la Predicción del Riesgo de Abandono Escolar

## 1. Descripción del proyecto

El proyecto consiste en desarrollar un sistema web que permita gestionar información de estudiantes, realizar predicciones del riesgo de abandono escolar y presentar información que facilite la identificación de estudiantes que podrían necesitar atención.

## 2. Objetivo

Implementar un sistema que permita analizar los datos académicos de los estudiantes para identificar su nivel de riesgo de abandono escolar y apoyar la toma de decisiones.

## 3. Tecnologías utilizadas

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pandas
- XGBoost
- SHAP (integración en desarrollo)

### Frontend
- React
- JavaScript
- CSS

### Base de datos
- PostgreSQL

## 4. Estructura del proyecto

- backend: contiene la lógica del servidor, los casos de uso, las entidades y la conexión con la base de datos.
- frontend: contiene las pantallas y componentes de la aplicación web.
- README.md: documentación del proyecto.
- .gitignore: archivos y carpetas que Git no debe subir.

## 5. Funcionalidades del sistema

- Registro e inicio de sesión de usuarios.
- Carga de datos de estudiantes.
- Almacenamiento de información en PostgreSQL.
- Predicción del nivel de riesgo de abandono escolar.
- Visualización de estudiantes y resultados.
- Explicación de los factores relacionados con el riesgo.
- Auditoría y reportes del sistema.

## 6. Ejecución del proyecto

### Backend

Ingresar a la carpeta backend, activar el entorno virtual e iniciar el servidor:

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

Documentación de la API:

http://127.0.0.1:8000/docs

### Frontend

Ingresar a la carpeta frontend e iniciar React:

```bash
cd frontend
npm install
npm start
```

## 7. Base de datos

El sistema utiliza PostgreSQL para almacenar la información de los estudiantes y los registros necesarios para el funcionamiento de la aplicación.

La conexión se configura mediante variables de entorno.

## 8. Estado del proyecto

Proyecto académico de Ingeniería de Sistemas e Informática.

La integración de explicabilidad mediante SHAP se encuentra en desarrollo.