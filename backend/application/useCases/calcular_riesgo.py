import math
from datetime import datetime

from domain.entities.estudiante import Estudiante
from domain.entities.prediccion_riesgo import PrediccionRiesgo
from domain.ports.predictor_riesgo_port import PredictorRiesgoPort

CAMPOS_NECESARIOS = [
    "asistencia",
    "promedio_academico",
    "cursos_desaprobados",
    "inasistencias_consecutivas",
]

CORTE_MEDIO = 25
CORTE_ALTO = 40


class CalcularRiesgoUseCase:
    def __init__(self, predictor: PredictorRiesgoPort):
        self.predictor = predictor

    def ejecutar(self, estudiante: Estudiante) -> PrediccionRiesgo:
        # Escenario 2: datos insuficientes
        if self._faltan_datos(estudiante):
            return PrediccionRiesgo(
                id_estudiante=estudiante.id_estudiante,
                nivel="indeterminado",
                puntaje=0.0,
                fecha_calculo=datetime.now(),
                advertencia="Baja confiabilidad: faltan datos del estudiante, "
                            "no se puede dar un puntaje definitivo.",
            )

        # Escenario 1: predicción disponible
        puntaje = self.predictor.predecir(estudiante)
        return PrediccionRiesgo(
            id_estudiante=estudiante.id_estudiante,
            nivel=self._clasificar(puntaje),
            puntaje=puntaje,
            fecha_calculo=datetime.now(),
        )

    def _faltan_datos(self, estudiante: Estudiante) -> bool:
        for campo in CAMPOS_NECESARIOS:
            valor = getattr(estudiante, campo, None)
            if valor is None or (isinstance(valor, float) and math.isnan(valor)):
                return True
        return False

    def _clasificar(self, puntaje: float) -> str:
        if puntaje >= CORTE_ALTO:
            return "alto"
        if puntaje >= CORTE_MEDIO:
            return "medio"
        return "bajo"