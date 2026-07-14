from __future__ import annotations

import base64
import io
import tarfile
from pathlib import Path

import pytest

import secure_extract_bundle as mod


def make_tar(entries: list[tuple[str, bytes, str]]) -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for name, payload, kind in entries:
            info = tarfile.TarInfo(name)
            info.size = len(payload)
            if kind == "file":
                tar.addfile(info, io.BytesIO(payload))
            elif kind == "symlink":
                info.type = tarfile.SYMTYPE
                info.linkname = "target"
                info.size = 0
                tar.addfile(info)
    return buf.getvalue()


def test_safe_member_name_rejects_traversal():
    for bad in ("../x", "/tmp/x", "a/../../x", "a\\..\\x"):
        with pytest.raises(mod.SecurityError):
            mod.safe_member_name(bad)


def test_safe_member_name_accepts_flat_file():
    assert mod.safe_member_name("README.md") == "README.md"


def test_inspect_rejects_symlink(tmp_path: Path):
    archive = make_tar([("README.md", b"", "symlink")])
    path = tmp_path / "x.tar.gz"
    path.write_bytes(archive)
    with tarfile.open(path, "r:gz") as bundle:
        with pytest.raises(mod.SecurityError):
            mod.inspect_members(bundle, mod.Limits())


def test_inspect_rejects_too_many_files(tmp_path: Path):
    archive = make_tar([(f"f{i}.txt", b"x", "file") for i in range(3)])
    path = tmp_path / "x.tar.gz"
    path.write_bytes(archive)
    with tarfile.open(path, "r:gz") as bundle:
        with pytest.raises(mod.SecurityError):
            mod.inspect_members(bundle, mod.Limits(max_files=2))


def test_git_blob_sha_is_stable():
    assert mod.git_blob_sha1(b"hello\n") == "ce013625030ba8dba906f756967f9e9ca394464a"


def test_decode_rejects_unpinned_source(tmp_path: Path):
    source = tmp_path / "bundle.b64"
    source.write_bytes(base64.b64encode(b"not the real bundle"))
    with pytest.raises(mod.SecurityError):
        mod.decode_source(source)
