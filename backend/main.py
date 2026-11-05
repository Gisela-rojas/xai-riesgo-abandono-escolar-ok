from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from infrastructure.db import (
    get_db, engine, Base,
    EstudianteModel, IdentidadEstudianteModel, UsuarioModel, LogSeguridadModel,
        FeedbackExplicacionModel,
)
from infrastructure.adapters.output.estudiante_repository_postgres import EstudianteRepositoryPostgres
from infrastructure.adapters.output.usuario_repository_postgres import UsuarioRepositoryPostgres
from infrastructure.adapters.output.predictor_riesgo_reglas import PredictorRiesgoReglas
from application.useCases.cargar_datos_estudiantes import CargarDatosEstudiantesUseCase
from application.useCases.registrar_usuario import RegistrarUsuarioUseCase
from application.useCases.login_usuario import LoginUsuarioUseCase
from application.useCases.calcular_riesgo import CalcularRiesgoUseCase
from application.useCases.explicar_riesgo import ExplicarRiesgoUseCase

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegistroRequest(BaseModel):
    nombre: str
    correo: str
    clave: str


class LoginRequest(BaseModel):
    
    correo: str
    clave: str

class FeedbackRequest(BaseModel):
    comentario: str = ""


@app.post("/estudiantes/cargar")
def cargar_estudiantes(archivo: UploadFile = File(...), db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    caso_de_uso = CargarDatosEstudiantesUseCase(repositorio)
    return caso_de_uso.ejecutar(archivo)


@app.get("/estudiantes")
def listar_estudiantes(db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    return repositorio.listar_todos()


@app.get("/estudiantes/{id_estudiante}/riesgo")
def calcular_riesgo(id_estudiante: int, db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    estudiante = repositorio.obtener_por_id_estudiante(id_estudiante)
    if estudiante is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    caso_de_uso = CalcularRiesgoUseCase(PredictorRiesgoReglas())
    return caso_de_uso.ejecutar(estudiante)


@app.get("/estudiantes/{id_estudiante}/explicacion")
def explicar_riesgo(id_estudiante: int, db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    estudiante = repositorio.obtener_por_id_estudiante(id_estudiante)
    if estudiante is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    caso_de_uso = ExplicarRiesgoUseCase(PredictorRiesgoReglas())
    return caso_de_uso.ejecutar(estudiante)


@app.post("/usuarios/registrar")
def registrar_usuario(datos: RegistroRequest, db: Session = Depends(get_db)):
    repositorio = UsuarioRepositoryPostgres(db)
    caso_de_uso = RegistrarUsuarioUseCase(repositorio)
    return caso_de_uso.ejecutar(datos.nombre, datos.correo, datos.clave)


@app.post("/usuarios/login")
def login_usuario(datos: LoginRequest, db: Session = Depends(get_db)):
    repositorio = UsuarioRepositoryPostgres(db)
    caso_de_uso = LoginUsuarioUseCase(repositorio)
    return caso_de_uso.ejecutar(datos.correo, datos.clave)

ROLES_AUTORIZADOS = {"docente", "toe"}


def registrar_intento(db, usuario, rol, ruta, motivo):
    db.add(LogSeguridadModel(usuario=usuario, rol=rol, ruta=ruta, motivo=motivo))
    db.commit()


# HU-007: solo roles autorizados pueden ver nombre y DNI
@app.get("/estudiantes/{id_estudiante}/identidad")
def ver_identidad(
    id_estudiante: int,
    x_usuario_correo: str = Header(default=None),
    db: Session = Depends(get_db),
):
    ruta = f"/estudiantes/{id_estudiante}/identidad"

    usuario = None
    if x_usuario_correo:
        usuario = db.query(UsuarioModel).filter(UsuarioModel.correo == x_usuario_correo).first()

    if usuario is None:
        registrar_intento(db, x_usuario_correo, None, ruta, "Usuario no identificado")
        raise HTTPException(status_code=401, detail="Acceso denegado")

    if usuario.rol not in ROLES_AUTORIZADOS:
        registrar_intento(db, usuario.correo, usuario.rol, ruta, "Rol sin permiso para datos identificables")
        raise HTTPException(status_code=403, detail="Acceso denegado")

    estudiante = db.query(EstudianteModel).filter(EstudianteModel.id_estudiante == id_estudiante).first()
    if estudiante is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    identidad = (
        db.query(IdentidadEstudianteModel)
        .filter(IdentidadEstudianteModel.codigo_pseudonimo == estudiante.codigo_pseudonimo)
        .first()
    )
    if identidad is None:
        raise HTTPException(status_code=404, detail="No hay identidad registrada para este estudiante")

    return {
        "id_estudiante": estudiante.id_estudiante,
        "codigo_pseudonimo": estudiante.codigo_pseudonimo,
        "nombre": identidad.nombre,
        "dni": identidad.dni,
    }

# HU-003: el docente reporta que una explicación no se comprendió
@app.post("/estudiantes/{id_estudiante}/feedback")
def reportar_explicacion(id_estudiante: int, datos: FeedbackRequest, db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    estudiante = repositorio.obtener_por_id_estudiante(id_estudiante)
    if estudiante is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    feedback = FeedbackExplicacionModel(
        id_estudiante=id_estudiante,
        comentario=datos.comentario or "Explicación no comprendida",
    )
    db.add(feedback)
    db.commit()
    return {"exito": True, "mensaje": "El caso quedó registrado para revisión del equipo."}

@app.get("/")
def inicio():
    return {"mensaje": "API Sistema XAI funcionando"}