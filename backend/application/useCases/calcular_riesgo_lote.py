from datetime import datetime

from application.useCases.calcular_riesgo import CalcularRiesgoUseCase


class CalcularRiesgoLoteUseCase:
    def __init__(self, predictor):
        self.predictor = predictor
        self._reglas = CalcularRiesgoUseCase(predictor)

    def ejecutar(self, estudiantes):
        puntajes = self.predictor.predecir_lote(estudiantes)
        resultados = []
        for e, puntaje in zip(estudiantes, puntajes):
            if self._reglas._faltan_datos(e):
                nivel, puntaje = "indeterminado", 0.0
            else:
                nivel = self._reglas._clasificar(puntaje)
            resultados.append({
                "id_estudiante": e.id_estudiante,
                "genero": e.genero,
                "grado": e.grado,
                "aula": e.aula,
                "asistencia": e.asistencia,
                "promedio_academico": e.promedio_academico,
                "cursos_desaprobados": e.cursos_desaprobados,
                "inasistencias_consecutivas": e.inasistencias_consecutivas,
                "nivel": nivel,
                "puntaje": puntaje,
            })

        # Mayor riesgo primero; los indeterminados al final
        resultados.sort(key=lambda r: (r["nivel"] == "indeterminado", -r["puntaje"]))

        resumen = {n: 0 for n in ["alto", "medio", "bajo", "indeterminado"]}
        for r in resultados:
            resumen[r["nivel"]] += 1

        return {
            "fecha_calculo": datetime.now().isoformat(),
            "resumen": resumen,
            "estudiantes": resultados,
        }