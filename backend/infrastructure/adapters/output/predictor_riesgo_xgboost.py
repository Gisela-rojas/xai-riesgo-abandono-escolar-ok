import re
from functools import lru_cache
from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
import pandas as pd
import shap

from domain.entities.estudiante import Estudiante
from domain.ports.predictor_riesgo_port import PredictorRiesgoPort

# El modelo está en la carpeta raíz del backend
RUTA_MODELO = Path(__file__).resolve().parents[3] / "modelo_xgboost.joblib"

# Factores que se le explican al docente (el grado no se muestra)
FACTORES_EXPLICABLES = [
    "asistencia",
    "promedio_academico",
    "cursos_desaprobados",
    "inasistencias_consecutivas",
]


@lru_cache(maxsize=1)
def _cargar():
    """Carga el modelo y el explicador una sola vez."""
    paquete = joblib.load(RUTA_MODELO)
    modelo = paquete["modelo"]
    return modelo, paquete["columnas"], shap.TreeExplainer(modelo)


def _grado_a_numero(grado):
    """Convierte '2°' en 2. Si no hay grado, devuelve dato faltante."""
    if grado is None:
        return np.nan
    coincidencia = re.search(r"\d", str(grado))
    return float(coincidencia.group()) if coincidencia else np.nan


class PredictorRiesgoXGBoost(PredictorRiesgoPort):
    def _fila(self, estudiante: Estudiante, columnas) -> pd.DataFrame:
        valores = {
            "asistencia": estudiante.asistencia,
            "promedio_academico": estudiante.promedio_academico,
            "cursos_desaprobados": estudiante.cursos_desaprobados,
            "inasistencias_consecutivas": estudiante.inasistencias_consecutivas,
            "grado": _grado_a_numero(estudiante.grado),
        }
        # Mismas columnas y mismo orden con los que se entrenó el modelo
        fila = [valores[c] for c in columnas]
        return pd.DataFrame([fila], columns=columnas).astype(float)

    def predecir(self, estudiante: Estudiante) -> float:
        modelo, columnas, _ = _cargar()
        probabilidad = modelo.predict_proba(self._fila(estudiante, columnas))[0][1]
        return round(float(probabilidad) * 100, 1)

    def calcular_aportes(self, estudiante: Estudiante) -> Dict[str, float]:
        _, columnas, explicador = _cargar()
        valores = explicador.shap_values(self._fila(estudiante, columnas))[0]
        por_factor = dict(zip(columnas, valores))
        return {nombre: float(por_factor[nombre]) for nombre in FACTORES_EXPLICABLES}

    def predecir_lote(self, estudiantes) -> List[float]:
        """Calcula el riesgo de muchos estudiantes de una sola vez."""
        modelo, columnas, _ = _cargar()
        filas = []
        for e in estudiantes:
            valores = {
                "asistencia": e.asistencia,
                "promedio_academico": e.promedio_academico,
                "cursos_desaprobados": e.cursos_desaprobados,
                "inasistencias_consecutivas": e.inasistencias_consecutivas,
                "grado": _grado_a_numero(e.grado),
            }
            filas.append([valores[c] for c in columnas])
        tabla = pd.DataFrame(filas, columns=columnas).astype(float)
        probabilidades = modelo.predict_proba(tabla)[:, 1]
        return [round(float(p) * 100, 1) for p in probabilidades]