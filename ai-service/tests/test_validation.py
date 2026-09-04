import io
import pytest
from PIL import Image
from app.utils.files import validate_storage_reference, validate_image_bytes
from app.utils.errors import (
    InvalidRequestException,
    FileTooLargeException,
    UnsupportedFileException,
)


def test_validate_storage_reference_valid():
    ref = "cases/123/evidence/456/photo.png"
    assert validate_storage_reference(ref) == ref


def test_validate_storage_reference_traversal_fails():
    with pytest.raises(InvalidRequestException):
        validate_storage_reference("../evil.png")

    with pytest.raises(InvalidRequestException):
        validate_storage_reference("cases/../../root")

    with pytest.raises(InvalidRequestException):
        validate_storage_reference("/absolute/path.png")


def test_validate_image_bytes_valid_png():
    img = Image.new("RGB", (100, 100), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    content = buf.getvalue()

    w, h, fmt = validate_image_bytes(content, content_type="image/png")
    assert w == 100
    assert h == 100
    assert fmt == "PNG"


def test_validate_image_bytes_unsupported_mime():
    img = Image.new("RGB", (100, 100))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    content = buf.getvalue()

    with pytest.raises(UnsupportedFileException):
        validate_image_bytes(content, content_type="application/pdf")


def test_validate_image_bytes_too_large():
    img = Image.new("RGB", (100, 100))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    content = buf.getvalue()

    with pytest.raises(FileTooLargeException):
        validate_image_bytes(content, max_size=10)
