import os
import socket
from django.core.exceptions import ImproperlyConfigured

BACKEND_HOST = os.getenv("BACKEND_HOST", "localhost")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "5000"))

def backend_is_running(host=BACKEND_HOST, port=BACKEND_PORT) -> bool:
    try:
        with socket.create_connection((host, port), timeout=1):
            return True
    except OSError:
        return False

def require_backend(testcase):
    if not backend_is_running():
        raise RuntimeError(f"Spring Boot backend is not running on {BACKEND_HOST}:{BACKEND_PORT}")

def destructive_allowed() -> bool:
    # You must set RUN_DESTRUCTIVE_INTEGRATION=1 to run ban/delete/accept tests
    return os.getenv("RUN_DESTRUCTIVE_INTEGRATION", "").strip() in ("1", "true", "TRUE", "yes", "YES")
