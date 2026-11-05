from dataclasses import dataclass

@dataclass
class Usuario:
    nombre: str
    correo: str
    clave: str