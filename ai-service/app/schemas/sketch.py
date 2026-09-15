from typing import Any, Dict, Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from app.schemas.common import BaseResponse



class SketchImage(BaseModel):
    url: str = Field(..., description="Access URL or storage reference for the generated sketch")
    content_type: str = Field("image/png", description="MIME content type of the sketch image")


class SketchGenerateRequest(BaseModel):
    mode: Literal["PROMPT_GENERATION", "DATASET_COMPOSITE"] = Field(
        "DATASET_COMPOSITE",
        description="Active synthesis mode: PROMPT_GENERATION (witness prompt) or DATASET_COMPOSITE (feature assembly)",
    )
    case_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier of the case",
        examples=["case-01JABCDEF1234567"],
    )
    witness_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier of the witness",
        examples=["wit-01JABCDEF1234567"],
    )
    attributes: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Structured facial attributes parsed from witness statement or dataset component selections",
        examples=[{"gender": "male", "face_shape": "oval", "hair": "curly dark brown"}],
    )
    components: Optional[Dict[str, str]] = Field(
        None,
        description="Explicit dataset component item selections (e.g. {'eyes': 'almond_01', 'nose': 'aquiline_02'})",
    )
    seed: Optional[int] = Field(
        None,
        description="Deterministic generation seed for reproducibility (e.g., 184729)",
        examples=[184729],
    )
    resolution: int = Field(
        512,
        ge=256,
        le=1024,
        description="Pixel resolution of the output sketch (default: 512 for RTX 4050 6GB)",
    )
    steps: int = Field(
        24,
        ge=10,
        le=50,
        description="Inference diffusion steps (default: 24)",
    )
    control_strength: float = Field(
        0.50,
        ge=0.0,
        le=1.0,
        description="ControlNet Lineart structural conditioning weight (default: 0.50)",
    )
    prompt: Optional[str] = Field(
        None,
        description="Witness statement narrative or investigator notes",
    )
    sketch_style: str = Field(
        "Forensic Graphite (Pencil)",
        description="Forensic art style (e.g. Forensic Graphite (Pencil), Realistic Charcoal, Digital Identi-Kit (Lineart), Color Age-Progressed)",
    )
    camera_angle: str = Field(
        "frontal",
        description="Camera perspective angle (frontal, three_quarter, profile)",
    )
    age_group: str = Field(
        "26-35",
        description="Estimated suspect age bracket (18-25, 26-35, 36-50, 50+)",
    )
    gender: str = Field(
        "Male",
        description="Suspect gender identification (Male, Female, Unspecified)",
    )
    ethnicity: Optional[str] = Field(
        "Unspecified",
        description="Suspect ethnic heritage or descent",
    )
    lighting_mood: Optional[str] = Field(
        "neutral_studio",
        description="Lighting setup (neutral_studio, crime_scene)",
    )
    detail_level: Optional[str] = Field(
        "Standard",
        description="Synthesis fidelity mode (Draft, Standard, Master)",
    )

    @field_validator("case_id", "witness_id", mode="before")
    @classmethod
    def strip_ids(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Identifier cannot be empty or whitespace-only.")
            return cleaned
        return v

    @field_validator("attributes", mode="before")
    @classmethod
    def validate_attributes(cls, v: Any) -> Dict[str, Any]:
        if v is None:
            return {}
        if not isinstance(v, dict):
            raise ValueError("Attributes must be a valid JSON object/dictionary.")
        return v

    @model_validator(mode="after")
    def enforce_mode_exclusivity(self) -> "SketchGenerateRequest":
        is_mode_explicit = "mode" in self.model_fields_set
        has_prompt = bool(self.prompt and self.prompt.strip())
        has_components = bool(self.components and len(self.components) > 0)
        has_attributes = bool(self.attributes and len(self.attributes) > 0)

        if self.mode == "PROMPT_GENERATION":
            if not has_prompt:
                raise ValueError("In PROMPT_GENERATION mode, 'prompt' must be provided and cannot be empty.")
            if has_components:
                raise ValueError("Strict Mode Exclusivity: 'components' cannot be provided in PROMPT_GENERATION mode.")
        elif self.mode == "DATASET_COMPOSITE":
            if is_mode_explicit and has_prompt:
                raise ValueError(
                    "Strict Mode Exclusivity: 'prompt' cannot be provided in DATASET_COMPOSITE mode. "
                    "Clear prompt or switch to PROMPT_GENERATION mode."
                )
            # For backward compatibility if mode was not explicitly passed:
            if not is_mode_explicit and has_prompt and not has_components:
                self.mode = "PROMPT_GENERATION"
            elif not has_attributes and not has_components:
                raise ValueError(
                    "In DATASET_COMPOSITE mode, at least one feature must be selected in 'attributes' or 'components'."
                )

        return self


class SketchGenerateResponse(BaseResponse):
    case_id: str
    witness_id: str
    image: SketchImage = Field(..., description="Generated forensic sketch image metadata")
    seed: Optional[int] = Field(None, description="Generation seed used for reproducibility")
    generation_id: Optional[str] = Field(None, description="Unique trace identifier for this generation run")
    mode: Optional[str] = Field(None, description="Execution mode (PROMPT_GENERATION or DATASET_COMPOSITE)")
    consistency_score: Optional[float] = Field(None, description="MediaPipe structural consistency metric (0.0 - 1.0)")
    refinement_passes: int = Field(0, description="Number of automated refinement passes executed")
    llm_analysis: Optional[Dict[str, Any]] = Field(
        None,
        description="Detailed forensic taxonomy and morphological reasoning deduced by the LLM",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Model parameters (resolution, steps, control_strength, model version)",
    )


