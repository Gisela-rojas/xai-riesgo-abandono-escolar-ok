from dataclasses import dataclass
from datetime import datetime


@dataclass
class PrediccionRiesgo:
    id_estudiante: int
    nivel: str                      # "bajo", "medio" o "alto"
    puntaje: float                  # de 0 a 100
    fecha_calculo: datetime
    advertencia: str | None = None  # se llena si hay pocos datos