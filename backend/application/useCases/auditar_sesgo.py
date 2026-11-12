from datetime import datetime
from typing import List

from domain.entities.estudiante import Estudiante
from domain.entities.resultado_auditoria import ResultadoAuditoria, ResultadoSubgrupo
from domain.ports.predictor_riesgo_port import PredictorRiesgoPort

UMBRAL_PP = 5.0          # diferencia máxima aceptable, en puntos porcentuales
CORTE_POSITIVO = 50.0    # igual que el modelo: puntaje de 50 o más = predice abandono


def _f1(reales: List[int], predichos: List[int]) -> float:
    tp = sum(1 for r, p in zip(reales, predichos) if r == 1 and p == 1)
    fp = sum(1 for r, p in zip(reales, predichos) if r == 0 and p == 1)
    fn = sum(1 for r, p in zip(reales, predichos) if r == 1 and p == 0)
    if tp == 0:
        return 0.0
    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    return 2 * precision * recall / (precision + recall) * 100


class AuditarSesgoUseCase:
    def __init__(self, predictor: PredictorRiesgoPort):
        self.predictor = predictor

    def ejecutar(self, estudiantes: List[Estudiante]) -> ResultadoAuditoria:
        reales, predichos, generos = [], [], []
        for e in estudiantes:
            # Solo se audita con estudiantes que tienen el resultado real y todos sus datos
            if e.abandono is None or e.promedio_academico is None or not e.genero:
                continue
            puntaje = self.predictor.predecir(e)
            reales.append(int(e.abandono))
            predichos.append(1 if puntaje >= CORTE_POSITIVO else 0)
            generos.append(e.genero)

        grupos = sorted(set(generos))
        if len(grupos) < 2:
            raise ValueError("No hay datos suficientes para auditar el sesgo por género.")

        f1_por_grupo = {}
        for g in grupos:
            r = [x for x, gen in zip(reales, generos) if gen == g]
            p = [x for x, gen in zip(predichos, generos) if gen == g]
            f1_por_grupo[g] = round(_f1(r, p), 1)

        diferencia = round(max(f1_por_grupo.values()) - min(f1_por_grupo.values()), 1)
        dentro = diferencia <= UMBRAL_PP

        return ResultadoAuditoria(
            estado="aceptable" if dentro else "requiere revisión",
            umbral_pp=UMBRAL_PP,
            f1_global=round(_f1(reales, predichos), 1),
            subgrupos=[
                ResultadoSubgrupo(
                    atributo="genero",
                    f1_por_grupo=f1_por_grupo,
                    diferencia_pp=diferencia,
                    dentro_del_umbral=dentro,
                )
            ],
            fecha=datetime.now(),
        )