from domain.entities.usuario import Usuario
from domain.ports.usuario_repository_port import UsuarioRepositoryPort


class RegistrarUsuarioUseCase:
    def __init__(self, repositorio: UsuarioRepositoryPort):
        self.repositorio = repositorio

    def ejecutar(self, nombre: str, correo: str, clave: str) -> dict:
        if not nombre or not correo or not clave:
            return {"exito": False, "error": "Completa todos los campos."}

        usuario = Usuario(nombre=nombre, correo=correo, clave=clave)
        guardado = self.repositorio.guardar(usuario)

        if not guardado:
            return {"exito": False, "error": "Ese correo ya está registrado."}

        return {"exito": True, "mensaje": "Usuario registrado correctamente."}