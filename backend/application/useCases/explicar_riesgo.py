from datetime import datetime

from domain.entities.estudiante import Estudiante
from domain.entities.explicacion_riesgo import ExplicacionRiesgo, FactorRiesgo
from domain.ports.predictor_riesgo_port import PredictorRiesgoPort
from application.useCases.calcular_riesgo import CORTE_MEDIO, CORTE_ALTO
##from application.useCases.explicar_riesgo import ExplicarRiesgoUseCase

MIN_FACTORES = 3
MAX_FACTORES = 5


class ExplicarRiesgoUseCase:
    def __init__(self, predictor: PredictorRiesgoPort):
        self.predictor = predictor

    def ejecutar(self, estudiante: Estudiante) -> ExplicacionRiesgo:
        aportes = self.predictor.calcular_aportes(estudiante)

        # Ordena los factores del que más pesa al que menos pesa
        ordenados = sorted(aportes.items(), key=lambda par: par[1], reverse=True)

        # Escenario 1: entre 3 y 5 factores
        con_aporte = [par for par in ordenados if par[1] > 0]
        if len(con_aporte) >= MIN_FACTORES:
            elegidos = con_aporte[:MAX_FACTORES]
        else:
            elegidos = ordenados[:MIN_FACTORES]

        factores = [
            self._armar_factor(campo, aporte, estudiante)
            for campo, aporte in elegidos
        ]

        puntaje = self.predictor.predecir(estudiante)
        return ExplicacionRiesgo(
            id_estudiante=estudiante.id_estudiante,
            nivel=self._clasificar(puntaje),
            puntaje=puntaje,
            factores=factores,
            fecha_calculo=datetime.now(),
        )

    def _armar_factor(self, campo: str, aporte: float, e: Estudiante) -> FactorRiesgo:
        # Lenguaje no técnico: nombres y frases que entiende un docente
        textos = {
            "asistencia": (
                "Asistencia baja",
                f"Asistió solo al {e.asistencia}% de las clases",
            ),
            "promedio_academico": (
                "Promedio académico bajo",
                f"Su promedio es {e.promedio_academico} sobre 20",
            ),
            "cursos_desaprobados": (
                "Cursos desaprobados",
                f"Tiene {e.cursos_desaprobados} curso(s) desaprobado(s)",
            ),
            "inasistencias_consecutivas": (
                "Faltas seguidas",
                f"Tiene {e.inasistencias_consecutivas} inasistencias consecutivas",
            ),
        }
        nombre, descripcion = textos[campo]
        return FactorRiesgo(nombre=nombre, descripcion=descripcion, aporte=round(aporte, 1))

    def _clasificar(self, puntaje: float) -> str:
        if puntaje >= CORTE_ALTO:
            return "alto"
        if puntaje >= CORTE_MEDIO:
            return "medio"
        return "bajo"