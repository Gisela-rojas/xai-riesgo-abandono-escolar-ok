from abc import ABC, abstractmethod


class SeudonimizadorPort(ABC):
    @abstractmethod
    def generar_codigo(self, dni: str) -> str:
        """Recibe el DNI y devuelve un código seudónimo que no se puede revertir."""
        ...