from typing import Dict

from domain.entities.estudiante import Estudiante
from domain.ports.predictor_riesgo_port import PredictorRiesgoPort

PESO_ASISTENCIA = 35
PESO_NOTAS = 30
PESO_CURSOS = 20
PESO_FALTAS = 15


def _entre_0_y_1(valor: float) -> float:
    return max(0.0, min(1.0, valor))


class PredictorRiesgoReglas(PredictorRiesgoPort):
    def calcular_aportes(self, estudiante: Estudiante) -> Dict[str, float]:
        """Devuelve cuántos puntos de riesgo aporta cada factor."""
        return {
            "asistencia": _entre_0_y_1((100 - estudiante.asistencia) / 100) * PESO_ASISTENCIA,
            "promedio_academico": _entre_0_y_1((20 - estudiante.promedio_academico) / 20) * PESO_NOTAS,
            "cursos_desaprobados": _entre_0_y_1(estudiante.cursos_desaprobados / 5) * PESO_CURSOS,
            "inasistencias_consecutivas": _entre_0_y_1(estudiante.inasistencias_consecutivas / 10) * PESO_FALTAS,
        }

    def predecir(self, estudiante: Estudiante) -> float:
        return round(sum(self.calcular_aportes(estudiante).values()), 1)