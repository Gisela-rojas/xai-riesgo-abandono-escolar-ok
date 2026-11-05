import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Numeric, Text, TIMESTAMP
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.sql import func

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class EstudianteModel(Base):
    __tablename__ = "estudiantes"

    id = Column(Integer, primary_key=True, index=True)
    id_estudiante = Column(Integer, nullable=False)
    codigo_pseudonimo = Column(String(20), index=True)
    genero = Column(String(1))
    asistencia = Column(Numeric(5, 2))
    promedio_academico = Column(Numeric(5, 2))
    cursos_desaprobados = Column(Integer)
    inasistencias_consecutivas = Column(Integer)
    rendimiento_academico = Column(String(20))
    grado = Column(String(5))
    aula = Column(String(5))
    abandono = Column(Integer)
    cargado_en = Column(TIMESTAMP, server_default=func.now())


class IdentidadEstudianteModel(Base):
    __tablename__ = "identidades_estudiantes"

    id = Column(Integer, primary_key=True, index=True)
    codigo_pseudonimo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(150))
    dni = Column(String(8))
    creado_en = Column(TIMESTAMP, server_default=func.now())


class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100), unique=True, nullable=False)
    clave = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False, server_default="docente")
    creado_en = Column(TIMESTAMP, server_default=func.now())


class FeedbackExplicacionModel(Base):
    __tablename__ = "feedback_explicaciones"

    id = Column(Integer, primary_key=True, index=True)
    id_estudiante = Column(Integer, nullable=False)
    comentario = Column(Text)
    estado = Column(String(20), nullable=False, server_default="pendiente")
    reportado_en = Column(TIMESTAMP, server_default=func.now())


class LogSeguridadModel(Base):
    __tablename__ = "log_seguridad"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(100))
    rol = Column(String(20))
    ruta = Column(String(200))
    motivo = Column(String(200))
    registrado_en = Column(TIMESTAMP, server_default=func.now())


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()