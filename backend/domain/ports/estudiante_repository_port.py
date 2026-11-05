from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities.estudiante import Estudiante


class EstudianteRepositoryPort(ABC):
    @abstractmethod
    def guardar_lote(self, estudiantes: List[Estudiante]) -> int:
        """Guarda una lista de estudiantes y devuelve cuántos se guardaron."""
        pass

    @abstractmethod
    def obtener_por_id_estudiante(self, id_estudiante: int) -> Optional[Estudiante]:
        """Devuelve el estudiante con ese id, o None si no existe."""
        pass