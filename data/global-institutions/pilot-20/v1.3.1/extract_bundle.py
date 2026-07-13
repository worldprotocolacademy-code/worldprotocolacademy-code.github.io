from __future__ import annotations

import base64
import pathlib
import tarfile

ROOT = pathlib.Path(__file__).resolve().parent
SOURCE = ROOT / "pilot20-v1.3.1.tar.gz.b64"
ARCHIVE = ROOT / "pilot20-v1.3.1.tar.gz"


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing bundle: {SOURCE}")
    ARCHIVE.write_bytes(base64.b64decode(SOURCE.read_text(encoding="utf-8")))
    with tarfile.open(ARCHIVE, "r:gz") as bundle:
        bundle.extractall(ROOT, filter="data")
    print(f"Extracted Pilot 20 v1.3.1 deliverables into {ROOT}")


if __name__ == "__main__":
    main()
