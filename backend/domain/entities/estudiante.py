
from dataclasses import dataclass
from typing import Optional


@dataclass
class Estudiante:
    id_estudiante: int
    genero: str
    asistencia: float
    promedio_academico: Optional[float]
    cursos_desaprobados: int
    inasistencias_consecutivas: int
    rendimiento_academico: str
    grado: Optional[str] = None
    aula: Optional[str] = None
    abandono: Optional[int] = None
    codigo_pseudonimo: Optional[str] = None
