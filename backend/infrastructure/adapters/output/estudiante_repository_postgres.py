from typing import List, Optional

from domain.entities.estudiante import Estudiante
from domain.ports.estudiante_repository_port import EstudianteRepositoryPort
from infrastructure.db import EstudianteModel


def convertir_float_seguro(valor) -> Optional[float]:
    if valor is None:
        return None
    return float(valor)


class EstudianteRepositoryPostgres(EstudianteRepositoryPort):

    def __init__(self, db):
        self.db = db

    def guardar_lote(self, estudiantes: List[Estudiante]) -> int:
        contador = 0

        for e in estudiantes:

            # Buscar si el estudiante ya existe
            modelo = (
                self.db.query(EstudianteModel)
                .filter(
                    EstudianteModel.id_estudiante == e.id_estudiante
                )
                .first()
            )

            # Si no existe, crear un registro nuevo
            if modelo is None:
                modelo = EstudianteModel(
                    id_estudiante=e.id_estudiante
                )
                self.db.add(modelo)

            # Actualizar sus datos, incluyendo abandono
            modelo.genero = e.genero
            modelo.asistencia = e.asistencia
            modelo.promedio_academico = e.promedio_academico
            modelo.cursos_desaprobados = e.cursos_desaprobados
            modelo.inasistencias_consecutivas = e.inasistencias_consecutivas
            modelo.rendimiento_academico = e.rendimiento_academico
            modelo.grado = e.grado
            modelo.aula = e.aula
            modelo.abandono = e.abandono

            contador += 1

        self.db.commit()
        return contador

    def listar_todos(self):
        filas = self.db.query(EstudianteModel).all()

        return [
            {
                "id": f.id,
                "id_estudiante": f.id_estudiante,
                "genero": f.genero,
                "asistencia": convertir_float_seguro(f.asistencia),
                "promedio_academico": convertir_float_seguro(
                    f.promedio_academico
                ),
                "cursos_desaprobados": f.cursos_desaprobados,
                "inasistencias_consecutivas": f.inasistencias_consecutivas,
                "rendimiento_academico": f.rendimiento_academico,
                "grado": f.grado,
                "aula": f.aula,
                "abandono": f.abandono,
            }
            for f in filas
        ]

    def obtener_por_id_estudiante(self, id_estudiante: int):

        fila = (
            self.db.query(EstudianteModel)
            .filter(
                EstudianteModel.id_estudiante == id_estudiante
            )
            .first()
        )

        if fila is None:
            return None

        return Estudiante(
            id_estudiante=fila.id_estudiante,
            genero=fila.genero,
            asistencia=convertir_float_seguro(fila.asistencia),
            promedio_academico=convertir_float_seguro(
                fila.promedio_academico
            ),
            cursos_desaprobados=fila.cursos_desaprobados,
            inasistencias_consecutivas=fila.inasistencias_consecutivas,
            rendimiento_academico=fila.rendimiento_academico,
            grado=fila.grado,
            aula=fila.aula,
            abandono=fila.abandono,
        )

    def listar_entidades(self) -> List[Estudiante]:
        filas = self.db.query(EstudianteModel).all()
        return [
            Estudiante(
                id_estudiante=f.id_estudiante,
                genero=f.genero,
                asistencia=convertir_float_seguro(f.asistencia),
                promedio_academico=convertir_float_seguro(f.promedio_academico),
                cursos_desaprobados=f.cursos_desaprobados,
                inasistencias_consecutivas=f.inasistencias_consecutivas,
                rendimiento_academico=f.rendimiento_academico,
                grado=f.grado,
                aula=f.aula,
                abandono=f.abandono,
            )
            for f in filas
        ]