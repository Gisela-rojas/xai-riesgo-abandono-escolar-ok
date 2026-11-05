from dataclasses import dataclass


@dataclass
class IdentidadEstudiante:
    codigo_pseudonimo: str
    nombre: str
    dni: str 