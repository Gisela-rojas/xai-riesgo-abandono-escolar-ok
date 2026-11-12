from datetime import datetime

from domain.entities.estudiante import Estudiante
from domain.entities.explicacion_riesgo import ExplicacionRiesgo, FactorRiesgo
from domain.ports.predictor_riesgo_port import PredictorRiesgoPort
from application.useCases.calcular_riesgo import CORTE_MEDIO, CORTE_ALTO

MIN_FACTORES = 3
MAX_FACTORES = 5


class ExplicarRiesgoUseCase:

    def __init__(self, predictor: PredictorRiesgoPort):
        self.predictor = predictor

    def ejecutar(self, estudiante: Estudiante) -> ExplicacionRiesgo:

        # Aportes SHAP de cada variable
        aportes = self.predictor.calcular_aportes(estudiante)

        # De mayor a menor aporte
        ordenados = sorted(aportes.items(), key=lambda par: par[1], reverse=True)

        # Primero los factores que aumentan el riesgo
        positivos = [par for par in ordenados if par[1] > 0]

        if len(positivos) >= MIN_FACTORES:
            elegidos = positivos[:MAX_FACTORES]
        else:
            # Si hay menos de 3, se completan con los siguientes (los que ayudan)
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
        # Factores que AUMENTAN el riesgo
        sube = {
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

        # Factores que AYUDAN a reducir el riesgo
        ayuda = {
            "asistencia": (
                "Asistencia adecuada",
                f"Asistió al {e.asistencia}% de las clases",
            ),
            "promedio_academico": (
                "Promedio académico adecuado",
                f"Su promedio es {e.promedio_academico} sobre 20",
            ),
            "cursos_desaprobados": (
                "Pocos cursos desaprobados",
                f"Tiene {e.cursos_desaprobados} curso(s) desaprobado(s)",
            ),
            "inasistencias_consecutivas": (
                "Pocas faltas seguidas",
                f"Tiene {e.inasistencias_consecutivas} inasistencias consecutivas",
            ),
        }

        textos = sube if aporte > 0 else ayuda
        nombre, descripcion = textos[campo]

        return FactorRiesgo(
            nombre=nombre,
            descripcion=descripcion,
            aporte=round(aporte, 1),
        )

    def _clasificar(self, puntaje: float) -> str:
        if puntaje >= CORTE_ALTO:
            return "alto"
        if puntaje >= CORTE_MEDIO:
            return "medio"
        return "bajo"