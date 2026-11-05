from abc import ABC, abstractmethod
from typing import Dict

from domain.entities.estudiante import Estudiante


class PredictorRiesgoPort(ABC):
    @abstractmethod
    def predecir(self, estudiante: Estudiante) -> float:
        """Recibe un estudiante y devuelve un puntaje de riesgo de 0 a 100."""
        ...

    @abstractmethod
    def calcular_aportes(self, estudiante: Estudiante) -> Dict[str, float]:
        """Devuelve cuántos puntos de riesgo aporta cada factor."""
        ...