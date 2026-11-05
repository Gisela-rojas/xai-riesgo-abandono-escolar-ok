from sqlalchemy import text
from infrastructure.db import engine

with engine.begin() as conexion:
    antes = conexion.execute(text("SELECT COUNT(*) FROM estudiantes")).scalar()
    conexion.execute(text("TRUNCATE TABLE estudiantes RESTART IDENTITY CASCADE"))
    despues = conexion.execute(text("SELECT COUNT(*) FROM estudiantes")).scalar()

print(f"Estudiantes antes: {antes}")
print(f"Estudiantes después: {despues}")

