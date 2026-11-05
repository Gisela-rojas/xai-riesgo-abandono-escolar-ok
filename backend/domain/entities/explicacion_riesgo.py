from dataclasses import dataclass
from datetime import datetime
from typing import List


@dataclass
class FactorRiesgo:
    nombre: str        # en lenguaje simple, por ejemplo "Asistencia baja"
    descripcion: str   # por ejemplo "Asistió solo al 70.4% de las clases"
    aporte: float      # puntos que este factor suma al riesgo


@dataclass
class ExplicacionRiesgo:
    id_estudiante: int
    nivel: str
    puntaje: float
    factores: List[FactorRiesgo]
    fecha_calculo: datetime