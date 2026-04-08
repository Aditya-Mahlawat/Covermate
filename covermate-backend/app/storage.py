import os
import tempfile


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_uploads_root() -> str:
    configured = os.getenv("UPLOADS_DIR")
    if configured:
        return configured

    if os.getenv("VERCEL"):
        return os.path.join(tempfile.gettempdir(), "covermate-uploads")

    return os.path.join(BASE_DIR, "uploads")


UPLOADS_ROOT = get_uploads_root()
POLICY_UPLOADS_DIR = os.path.join(UPLOADS_ROOT, "policies")
CLAIMS_UPLOADS_DIR = os.path.join(UPLOADS_ROOT, "claims-bucket")
