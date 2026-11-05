from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List


@dataclass
class ResultadoSubgrupo:
    atributo: str                 # por ejemplo "genero" o "zona"
    f1_por_grupo: Dict[str, float]
    diferencia_pp: float          # diferencia máxima en puntos porcentuales
    dentro_del_umbral: bool


@dataclass
class ResultadoAuditoria:
    estado: str                   # "aceptable" o "requiere revisión"
    umbral_pp: float
    f1_global: float
    subgrupos: List[ResultadoSubgrupo]
    fecha: datetime