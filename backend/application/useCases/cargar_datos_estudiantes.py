import pandas as pd
from domain.entities.estudiante import Estudiante
from domain.ports.estudiante_repository_port import EstudianteRepositoryPort

COLUMNAS_REQUERIDAS = [
    "id_estudiante", "genero", "asistencia", "promedio_academico",
    "cursos_desaprobados", "inasistencias_consecutivas", "rendimiento_academico",
    "grado", "aula",
]

FORMATOS_VALIDOS = (".csv", ".xlsx", ".xls")


class CargarDatosEstudiantesUseCase:
    def __init__(self, repositorio: EstudianteRepositoryPort):
        self.repositorio = repositorio

    def ejecutar(self, archivo) -> dict:
        nombre = archivo.filename.lower()

        # Escenario 2: formato no soportado
        if not nombre.endswith(FORMATOS_VALIDOS):
            return {"exito": False, "error": "Formato no soportado. Use CSV o Excel (.xlsx, .xls)"}

        if nombre.endswith(".csv"):
            df = pd.read_csv(archivo.file)
        else:
            df = pd.read_excel(archivo.file)

        # Escenario 2: columnas faltantes
        faltantes = [c for c in COLUMNAS_REQUERIDAS if c not in df.columns]
        if faltantes:
            return {"exito": False, "error": f"Faltan columnas: {', '.join(faltantes)}"}

        # Escenario 1: carga exitosa
        estudiantes = [
            Estudiante(
                id_estudiante=int(row["id_estudiante"]),
                genero=str(row["genero"]),
                asistencia=float(row["asistencia"]),
                promedio_academico=float(row["promedio_academico"]),
                cursos_desaprobados=int(row["cursos_desaprobados"]),
                inasistencias_consecutivas=int(row["inasistencias_consecutivas"]),
                rendimiento_academico=str(row["rendimiento_academico"]),
                grado=str(row["grado"]).strip(),
                aula=str(row["aula"]).strip(),
            )
            for _, row in df.iterrows()
        ]

        total = self.repositorio.guardar_lote(estudiantes)
        return {"exito": True, "registros_guardados": total}