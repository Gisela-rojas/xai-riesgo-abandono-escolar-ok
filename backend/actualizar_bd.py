from sqlalchemy import text, inspect
from infrastructure.db import engine, Base

Base.metadata.create_all(bind=engine)

with engine.begin() as conexion:
    conexion.execute(text(
        "ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS codigo_pseudonimo VARCHAR(20)"
    ))
    conexion.execute(text(
        "CREATE INDEX IF NOT EXISTS ix_estudiantes_codigo_pseudonimo "
        "ON estudiantes (codigo_pseudonimo)"
    ))
    conexion.execute(text(
        "ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS abandono INTEGER"
    ))
    conexion.execute(text(
        "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) NOT NULL DEFAULT 'docente'"
    ))

insp = inspect(engine)
print("Tablas:", sorted(insp.get_table_names()))
print("estudiantes:", [c["name"] for c in insp.get_columns("estudiantes")])
print("usuarios:", [c["name"] for c in insp.get_columns("usuarios")])