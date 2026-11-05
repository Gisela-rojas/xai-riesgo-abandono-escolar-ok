from domain.ports.usuario_repository_port import UsuarioRepositoryPort
from infrastructure.adapters.output.usuario_repository_postgres import hashear


class LoginUsuarioUseCase:
    def __init__(self, repositorio: UsuarioRepositoryPort):
        self.repositorio = repositorio

    def ejecutar(self, correo: str, clave: str) -> dict:
        usuario = self.repositorio.buscar_por_correo(correo)

        if not usuario or usuario["clave"] != hashear(clave):
            return {"exito": False, "error": "Correo o contraseña incorrectos."}

        return {
            "exito": True,
            "nombre": usuario["nombre"],
            "correo": usuario["correo"],
            "rol": usuario.get("rol"),
        }