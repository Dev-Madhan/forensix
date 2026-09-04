"""Sketch generation provider adapters."""

from app.providers.sketch.mock import MockSketchProvider
from app.providers.sketch.diffusion_local import LocalDiffusionProvider

__all__ = ["MockSketchProvider", "LocalDiffusionProvider"]
