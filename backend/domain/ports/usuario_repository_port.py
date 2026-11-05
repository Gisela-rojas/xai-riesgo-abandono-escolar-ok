from abc import ABC, abstractmethod
from typing import Optional
from domain.entities.usuario import Usuario


class UsuarioRepositoryPort(ABC):
    @abstractmethod
    def guardar(self, usuario: Usuario) -> bool:
        pass

    @abstractmethod
    def buscar_por_correo(self, correo: str) -> Optional[dict]:
        pass