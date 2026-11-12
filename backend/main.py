import json
import os
from datetime import date

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from infrastructure.db import (
    get_db, engine, Base,
    EstudianteModel, IdentidadEstudianteModel, UsuarioModel, LogSeguridadModel,
    FeedbackExplicacionModel, PrediccionModel, IntervencionModel,
)
from infrastructure.adapters.output.estudiante_repository_postgres import EstudianteRepositoryPostgres
from infrastructure.adapters.output.usuario_repository_postgres import UsuarioRepositoryPostgres
from infrastructure.adapters.output.predictor_riesgo_reglas import PredictorRiesgoReglas
from infrastructure.adapters.output.predictor_riesgo_xgboost import PredictorRiesgoXGBoost
from application.useCases.cargar_datos_estudiantes import CargarDatosEstudiantesUseCase
from application.useCases.registrar_usuario import RegistrarUsuarioUseCase
from application.useCases.login_usuario import LoginUsuarioUseCase
from application.useCases.calcular_riesgo import CalcularRiesgoUseCase
from application.useCases.explicar_riesgo import ExplicarRiesgoUseCase
from application.useCases.calcular_riesgo_lote import CalcularRiesgoLoteUseCase
from application.useCases.auditar_sesgo import AuditarSesgoUseCase
from domain.entities.estudiante import Estudiante

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Direcciones permitidas: las fijas, las de la variable ALLOWED_ORIGINS de Render
# y cualquier dirección de Vercel (*.vercel.app)
origenes = [
    "http://localhost:3000",
    "https://xai-riesgo-abandono-escolar-ok.vercel.app",
    "https://xai-riesgo-abandono-escolar-nufeiryby-gisela-rojas.vercel.app",
]
origenes += [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
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


class IntervencionRequest(BaseModel):
    fecha: date
    descripcion: str


@app.post("/estudiantes/cargar")
def cargar_estudiantes(archivo: UploadFile = File(...), db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    caso_de_uso = CargarDatosEstudiantesUseCase(repositorio)
    return caso_de_uso.ejecutar(archivo)


@app.get("/estudiantes")
def listar_estudiantes(db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    return repositorio.listar_todos()


@app.get("/estudiantes/riesgo")
def calcular_riesgo_lote(solo_resumen: bool = False, db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    estudiantes = repositorio.listar_entidades()
    caso_de_uso = CalcularRiesgoLoteUseCase(PredictorRiesgoXGBoost())
    resultado = caso_de_uso.ejecutar(estudiantes)
    if solo_resumen:
        return {"fecha_calculo": resultado["fecha_calculo"], "resumen": resultado["resumen"]}
    return resultado


@app.get("/estudiantes/{id_estudiante}/riesgo")
def calcular_riesgo(id_estudiante: int, db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    estudiante = repositorio.obtener_por_id_estudiante(id_estudiante)
    if estudiante is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    caso_de_uso = CalcularRiesgoUseCase(PredictorRiesgoXGBoost())
    return caso_de_uso.ejecutar(estudiante)


@app.get("/estudiantes/{id_estudiante}/explicacion")
def explicar_riesgo(id_estudiante: int, db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    estudiante = repositorio.obtener_por_id_estudiante(id_estudiante)
    if estudiante is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    caso_de_uso = ExplicarRiesgoUseCase(PredictorRiesgoXGBoost())
    resultado = caso_de_uso.ejecutar(estudiante)

    # HU-008: guardar la predicción en el historial
    factores_texto = json.dumps(
        [{"nombre": f.nombre, "descripcion": f.descripcion, "aporte": f.aporte}
         for f in resultado.factores],
        ensure_ascii=False,
    )
    db.add(PrediccionModel(
        id_estudiante=id_estudiante,
        nivel_riesgo=resultado.nivel,
        probabilidad=round(resultado.puntaje / 100, 4),
        factores_influyentes=factores_texto,
    ))
    db.commit()

    return resultado


@app.post("/usuarios/registrar")
def registrar_usuario(datos: RegistroRequest, db: Session = Depends(get_db)):
    repositorio = UsuarioRepositoryPostgres(db)
    caso_de_uso = RegistrarUsuarioUseCase(repositorio)
    return caso_de_uso.ejecutar(datos.nombre, datos.correo, datos.clave)


@app.post("/usuarios/login")
def login_usuario(datos: LoginRequest, db: Session = Depends(get_db)):
    repositorio = UsuarioRepositoryPostgres(db)
    caso_de_uso = LoginUsuarioUseCase(repositorio)

    resultado = caso_de_uso.ejecutar(datos.correo, datos.clave)

    if not resultado.get("exito"):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos."
        )

    return resultado


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


# HU-006: auditoría de sesgo por género
@app.get("/auditoria/sesgo")
def auditar_sesgo(db: Session = Depends(get_db)):
    filas = db.query(EstudianteModel).all()
    estudiantes = [
        Estudiante(
            id_estudiante=f.id_estudiante,
            genero=f.genero,
            asistencia=float(f.asistencia) if f.asistencia is not None else None,
            promedio_academico=float(f.promedio_academico) if f.promedio_academico is not None else None,
            cursos_desaprobados=f.cursos_desaprobados,
            inasistencias_consecutivas=f.inasistencias_consecutivas,
            rendimiento_academico=f.rendimiento_academico,
            grado=f.grado,
            aula=f.aula,
            abandono=f.abandono,
        )
        for f in filas
    ]
    caso_de_uso = AuditarSesgoUseCase(PredictorRiesgoXGBoost())
    try:
        return caso_de_uso.ejecutar(estudiantes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# HU-008: historial de predicciones e intervenciones
@app.get("/estudiantes/{id_estudiante}/historial")
def ver_historial(id_estudiante: int, db: Session = Depends(get_db)):
    predicciones = (
        db.query(PrediccionModel)
        .filter(PrediccionModel.id_estudiante == id_estudiante)
        .order_by(PrediccionModel.id.desc())
        .all()
    )
    intervenciones = (
        db.query(IntervencionModel)
        .filter(IntervencionModel.id_estudiante == id_estudiante)
        .order_by(IntervencionModel.fecha.desc(), IntervencionModel.id.desc())
        .all()
    )
    return {
        "id_estudiante": id_estudiante,
        "predicciones": [
            {
                "id": p.id,
                "fecha": p.creado_en.isoformat() if p.creado_en else None,
                "puntaje": round(float(p.probabilidad) * 100, 1),
                "nivel": p.nivel_riesgo,
                "factores": json.loads(p.factores_influyentes) if p.factores_influyentes else [],
            }
            for p in predicciones
        ],
        "intervenciones": [
            {"id": i.id, "fecha": i.fecha.isoformat(), "descripcion": i.descripcion}
            for i in intervenciones
        ],
    }


@app.post("/estudiantes/{id_estudiante}/intervenciones")
def registrar_intervencion(id_estudiante: int, datos: IntervencionRequest, db: Session = Depends(get_db)):
    repositorio = EstudianteRepositoryPostgres(db)
    if repositorio.obtener_por_id_estudiante(id_estudiante) is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    if not datos.descripcion.strip():
        raise HTTPException(status_code=400, detail="Escribe qué se hizo con el estudiante.")
    db.add(IntervencionModel(
        id_estudiante=id_estudiante,
        fecha=datos.fecha,
        descripcion=datos.descripcion.strip(),
    ))
    db.commit()
    return {"exito": True, "mensaje": "Intervención registrada."}