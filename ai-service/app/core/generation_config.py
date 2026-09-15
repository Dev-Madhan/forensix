"""
Generation Configuration and Execution Mode Context.
Enforces explicit execution mode and generation lifecycle parameters.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, Literal, Optional
from uuid import uuid4

GenerationMode = Literal["PROMPT_GENERATION", "DATASET_COMPOSITE"]


@dataclass
class GenerationConfig:
    """
    Runtime execution configuration holding mode, parameters, and metadata
    for a forensic sketch synthesis pipeline run.
    """
    case_id: str
    witness_id: str
    mode: GenerationMode = "DATASET_COMPOSITE"
    generation_id: str = field(default_factory=lambda: uuid4().hex[:16])
    seed: Optional[int] = None
    resolution: int = 512
    steps: int = 24
    control_strength: float = 0.50
    sketch_style: str = "Forensic Graphite (Pencil)"
    camera_angle: str = "frontal"
    age_group: str = "26-35"
    gender: str = "Male"
    ethnicity: Optional[str] = "Unspecified"
    lighting_mood: Optional[str] = "neutral_studio"
    detail_level: Optional[str] = "Standard"
    prompt: Optional[str] = None
    attributes: Dict[str, Any] = field(default_factory=dict)
    components: Optional[Dict[str, str]] = None
    controlnet_enabled: bool = True
    max_refinement_passes: int = 2
    consistency_threshold: float = 0.75
