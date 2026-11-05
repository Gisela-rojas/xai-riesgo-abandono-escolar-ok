from sqlalchemy import text, inspect
from infrastructure.db import engine

columnas = [c["name"] for c in inspect(engine).get_columns("predicciones")]
print("Columnas de predicciones:", columnas)

with engine.begin() as conexion:
    total = conexion.execute(text("SELECT COUNT(*) FROM predicciones")).scalar()
print("Filas en predicciones:", total)