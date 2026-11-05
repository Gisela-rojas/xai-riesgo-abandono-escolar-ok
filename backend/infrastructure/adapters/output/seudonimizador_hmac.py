import hashlib
import hmac
import os

from dotenv import load_dotenv

from domain.ports.seudonimizador_port import SeudonimizadorPort

load_dotenv()


class SeudonimizadorHmac(SeudonimizadorPort):
    def __init__(self):
        secreto = os.getenv("CLAVE_SEUDONIMIZACION")
        if not secreto:
            raise RuntimeError("Falta CLAVE_SEUDONIMIZACION en el archivo .env")
        self._secreto = secreto.encode("utf-8")

    def generar_codigo(self, dni: str) -> str:
        firma = hmac.new(self._secreto, dni.strip().encode("utf-8"), hashlib.sha256).hexdigest()
        return "EST-" + firma[:12].upper()