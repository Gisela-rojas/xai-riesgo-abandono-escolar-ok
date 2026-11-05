import hashlib
from typing import Optional
from domain.entities.usuario import Usuario
from domain.ports.usuario_repository_port import UsuarioRepositoryPort
from infrastructure.db import UsuarioModel


def hashear(texto: str) -> str:
    return hashlib.sha256(texto.encode()).hexdigest()


class UsuarioRepositoryPostgres(UsuarioRepositoryPort):
    def __init__(self, db):
        self.db = db

    def guardar(self, usuario: Usuario) -> bool:
        existente = self.db.query(UsuarioModel).filter(UsuarioModel.correo == usuario.correo).first()
        if existente:
            return False
        modelo = UsuarioModel(
            nombre=usuario.nombre,
            correo=usuario.correo,
            clave=hashear(usuario.clave),
        )
        self.db.add(modelo)
        self.db.commit()
        return True

    def buscar_por_correo(self, correo: str) -> Optional[dict]:
        modelo = self.db.query(UsuarioModel).filter(UsuarioModel.correo == correo).first()
        if not modelo:
            return None
        return {
                    "nombre": modelo.nombre,
                    "correo": modelo.correo,
                    "clave": modelo.clave,
                    "rol": getattr(modelo, "rol", None),
                }