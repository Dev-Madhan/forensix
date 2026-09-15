"""
Forensic Facial Taxonomy Schema v2.0
Defines the canonical schema, confidence tracking, source attribution,
feature weights, and normalization mapping for the AI Forensic Composite Sketch System.
"""

from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field, model_validator

TAXONOMY_VERSION: str = "2.0"

# Canonical feature importance weights for geometric alignment and post-generation consistency
FEATURE_WEIGHTS: Dict[str, float] = {
    "face": 0.15,
    "eyes": 0.20,
    "eyebrows": 0.10,
    "nose": 0.15,
    "mouth": 0.15,
    "jaw": 0.10,
    "chin": 0.05,
    "hair": 0.05,
    "facial_hair": 0.05,
}

# Domain-specific valid canonical attribute values
VALID_VALUES: Dict[str, Dict[str, List[str]]] = {
    "face": {
        "face_shape": ["oval", "round", "square", "oblong", "heart", "diamond", "triangle"],
        "skin_tone": ["fair", "pale", "medium", "tan", "olive", "dark", "deep"],
        "cheekbones": ["high", "prominent", "flat", "subtle", "rounded"],
    },
    "eyes": {
        "shape": ["almond", "round", "narrow", "hooded", "deep-set", "monolid", "upturned", "downturned"],
        "size": ["small", "medium", "large"],
        "spacing": ["close", "normal", "wide"],
        "tilt": ["neutral", "upward", "downward"],
        "color": ["dark brown", "light brown", "hazel", "green", "blue", "gray", "amber", "black"],
        "eye_bags": ["none", "slight", "prominent"],
    },
    "eyebrows": {
        "thickness": ["thin", "medium", "thick", "bushy"],
        "shape": ["straight", "arched", "rounded", "s-shaped", "upward"],
        "distance": ["close", "normal", "distant"],
    },
    "nose": {
        "bridge": ["straight", "convex", "concave", "aquiline", "flat", "humped"],
        "length": ["short", "medium", "long"],
        "width": ["narrow", "medium", "wide"],
        "tip": ["pointed", "rounded", "bulbous", "upturned", "down-turned"],
        "nostrils": ["narrow", "medium", "flared"],
    },
    "mouth": {
        "width": ["narrow", "medium", "wide"],
        "upper_lip": ["thin", "medium", "full"],
        "lower_lip": ["thin", "medium", "full"],
        "philtrum": ["shallow", "normal", "deep"],
    },
    "jaw": {
        "width": ["narrow", "medium", "wide"],
        "shape": ["angular", "rounded", "square", "soft"],
    },
    "chin": {
        "size": ["small", "medium", "large"],
        "shape": ["pointed", "rounded", "square", "protruding", "receding"],
        "cleft": ["none", "subtle", "prominent"],
    },
    "hair": {
        "length": ["bald", "buzz cut", "short", "medium", "long", "very long"],
        "texture": ["straight", "wavy", "curly", "coily", "kinky", "bald"],
        "color": ["black", "dark brown", "light brown", "blonde", "red", "gray", "white"],
        "hairline": ["straight", "widow's peak", "receding", "high", "uneven"],
    },
    "facial_hair": {
        "type": ["none", "clean-shaven", "stubble", "mustache", "goatee", "beard", "full beard", "sideburns"],
        "thickness": ["light", "medium", "dense"],
        "color": ["black", "brown", "blonde", "gray", "red"],
    },
}

# Synonyms, colloquial expressions, and aliases mapped to canonical tokens
NORMALIZATION_MAP: Dict[str, str] = {
    # Face shape
    "chubby": "round",
    "fat": "round",
    "slender": "oval",
    "skinny": "narrow",
    "angular": "square",
    "sharp": "angular",
    "long": "oblong",
    "elongated": "oblong",
    "heart-shaped": "heart",
    # Eyes
    "slanted": "narrow",
    "squinty": "narrow",
    "big": "large",
    "huge": "large",
    "tiny": "small",
    "far-apart": "wide",
    "close-set": "close",
    "slanting up": "upward",
    "slanting down": "downward",
    # Eyebrows
    "bushy": "thick",
    "sparse": "thin",
    "plucked": "thin",
    "curved": "arched",
    "flat": "straight",
    "unibrow": "close",
    # Nose
    "hooked": "aquiline",
    "roman": "aquiline",
    "broad": "wide",
    "fat nose": "wide",
    "button": "upturned",
    "snub": "upturned",
    "bumpy": "humped",
    "crooked": "convex",
    "sharp tip": "pointed",
    "big tip": "bulbous",
    # Mouth & lips
    "thin lips": "thin",
    "thick lips": "full",
    "plump": "full",
    "pouty": "full",
    "broad smile": "wide",
    # Jaw / Chin
    "strong jaw": "square",
    "chiseled": "angular",
    "weak chin": "receding",
    "jutting chin": "protruding",
    "dimpled chin": "cleft",
    # Hair
    "shaved": "buzz cut",
    "bald head": "bald",
    "none": "none",
    "no hair": "bald",
    "afro": "coily",
    "frizzy": "curly",
    "brunette": "dark brown",
    "fair hair": "blonde",
    "ginger": "red",
    # Facial hair
    "clean shaven": "clean-shaven",
    "beardless": "none",
    "no beard": "none",
    "smooth face": "clean-shaven",
    "5 o'clock shadow": "stubble",
    "five o'clock shadow": "stubble",
    "goatie": "goatee",
    "heavy beard": "full beard",
}


class AttributeValue(BaseModel):
    """
    Represents a granular attribute value with confidence tracking and extraction source.
    """
    value: str = Field(..., description="Canonical or raw string value of the attribute")
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0.0 and 1.0 (witness certainty or model extraction confidence)",
    )
    source: Literal["explicit", "inferred", "unknown"] = Field(
        default="explicit",
        description="Origin of attribute value: explicit mention, domain inference, or unknown",
    )
    normalized: Optional[str] = Field(
        default=None,
        description="Normalized canonical taxonomy value if mapped from synonym/alias",
    )

    @model_validator(mode="after")
    def apply_normalization(self) -> "AttributeValue":
        if self.normalized is None and isinstance(self.value, str):
            clean_val = self.value.strip().lower()
            if clean_val in NORMALIZATION_MAP:
                self.normalized = NORMALIZATION_MAP[clean_val]
            else:
                self.normalized = clean_val
        return self


class ForensicAttributeSchemaV2(BaseModel):
    """
    Forensic Attribute Schema v2.0.
    Standardized, strongly-typed multi-domain representation for facial morphology,
    supporting confidence scoring, source attribution, and seamless v1 backward compatibility.
    """
    face: Dict[str, AttributeValue] = Field(default_factory=dict, description="Face shape, skin tone, cheekbones")
    eyes: Dict[str, AttributeValue] = Field(default_factory=dict, description="Eye morphology (shape, size, spacing, tilt, color)")
    eyebrows: Dict[str, AttributeValue] = Field(default_factory=dict, description="Eyebrow morphology (thickness, shape, distance)")
    nose: Dict[str, AttributeValue] = Field(default_factory=dict, description="Nose morphology (bridge, length, width, tip, nostrils)")
    mouth: Dict[str, AttributeValue] = Field(default_factory=dict, description="Mouth and lip morphology (width, upper_lip, lower_lip)")
    jaw: Dict[str, AttributeValue] = Field(default_factory=dict, description="Jaw structure (width, shape)")
    chin: Dict[str, AttributeValue] = Field(default_factory=dict, description="Chin morphology (size, shape, cleft)")
    hair: Dict[str, AttributeValue] = Field(default_factory=dict, description="Head hair (length, texture, color, hairline)")
    facial_hair: Dict[str, AttributeValue] = Field(default_factory=dict, description="Facial hair (type, thickness, color)")
    distinctive_features: List[AttributeValue] = Field(
        default_factory=list,
        description="Distinctive marks such as scars, tattoos, piercings, moles, or glasses",
    )
    unknown_attributes: List[str] = Field(
        default_factory=list,
        description="Attributes explicitly mentioned as unknown or unseen by the witness",
    )
    ambiguous_attributes: List[str] = Field(
        default_factory=list,
        description="Attributes flagged as contradictory or requiring investigator disambiguation",
    )
    overall_confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Aggregated confidence metric across all extracted attributes",
    )

    def get_attr(self, domain: str, key: str) -> Optional[AttributeValue]:
        domain_dict = getattr(self, domain, None)
        if isinstance(domain_dict, dict):
            return domain_dict.get(key)
        return None

    def get_value(self, domain: str, key: str, default: Optional[str] = None) -> Optional[str]:
        attr = self.get_attr(domain, key)
        if attr is not None:
            return attr.normalized or attr.value
        return default

    def to_flat_dict(self) -> Dict[str, Any]:
        """
        Flattens domains into standard key: value dictionary.
        Compatible with legacy prompt generators and geometry computation.
        """
        flat: Dict[str, Any] = {}
        for domain_name in ["face", "eyes", "eyebrows", "nose", "mouth", "jaw", "chin", "hair", "facial_hair"]:
            domain_dict: Dict[str, AttributeValue] = getattr(self, domain_name, {})
            for k, v in domain_dict.items():
                val = v.normalized if v.normalized else v.value
                # Prefix or standard key
                flat[f"{domain_name}_{k}"] = val
                if k == "face_shape" and domain_name == "face":
                    flat["face_shape"] = val
                elif domain_name == "hair" and k == "texture":
                    flat["hair"] = val
                elif domain_name == "facial_hair" and k == "type":
                    flat["facial_hair"] = val
                else:
                    flat[k] = val

        if self.distinctive_features:
            flat["distinctive_features"] = [
                d.normalized if d.normalized else d.value for d in self.distinctive_features
            ]
        return flat

    def to_nested_dict(self) -> Dict[str, Any]:
        """
        Exports clean nested dictionary for API responses.
        """
        return self.model_dump()

    @classmethod
    def from_v1_dict(cls, data: Dict[str, Any], default_confidence: float = 0.9) -> "ForensicAttributeSchemaV2":
        """
        Constructs a ForensicAttributeSchemaV2 from legacy flat or nested v1 dictionaries.
        """
        schema = cls()
        if not isinstance(data, dict):
            return schema

        # Domain mappings for known flat keys
        key_to_domain = {
            "face_shape": ("face", "face_shape"),
            "skin_tone": ("face", "skin_tone"),
            "cheekbones": ("face", "cheekbones"),
            "eye_shape": ("eyes", "shape"),
            "eye_size": ("eyes", "size"),
            "eye_spacing": ("eyes", "spacing"),
            "eye_tilt": ("eyes", "tilt"),
            "eye_color": ("eyes", "color"),
            "eyebrow_thickness": ("eyebrows", "thickness"),
            "eyebrow_shape": ("eyebrows", "shape"),
            "nose_bridge": ("nose", "bridge"),
            "nose_length": ("nose", "length"),
            "nose_width": ("nose", "width"),
            "nose_tip": ("nose", "tip"),
            "mouth_width": ("mouth", "width"),
            "upper_lip": ("mouth", "upper_lip"),
            "lower_lip": ("mouth", "lower_lip"),
            "jaw_width": ("jaw", "width"),
            "jaw_shape": ("jaw", "shape"),
            "chin_size": ("chin", "size"),
            "chin_shape": ("chin", "shape"),
            "hair": ("hair", "texture"),
            "hair_length": ("hair", "length"),
            "hair_texture": ("hair", "texture"),
            "hair_color": ("hair", "color"),
            "facial_hair": ("facial_hair", "type"),
            "facial_hair_type": ("facial_hair", "type"),
            "facial_hair_thickness": ("facial_hair", "thickness"),
        }

        # First inspect nested domains if present
        for domain in ["face", "eyes", "eyebrows", "nose", "mouth", "jaw", "chin", "hair", "facial_hair"]:
            sub = data.get(domain)
            if isinstance(sub, dict):
                target_dict = getattr(schema, domain)
                for sub_k, sub_v in sub.items():
                    if isinstance(sub_v, dict) and "value" in sub_v:
                        target_dict[sub_k] = AttributeValue(
                            value=str(sub_v["value"]),
                            confidence=float(sub_v.get("confidence", default_confidence)),
                            source=sub_v.get("source", "explicit"),
                            normalized=sub_v.get("normalized"),
                        )
                    elif isinstance(sub_v, (str, int, float, bool)):
                        target_dict[sub_k] = AttributeValue(
                            value=str(sub_v),
                            confidence=default_confidence,
                            source="explicit",
                        )

        # Inspect flat keys
        for key, val in data.items():
            if key in ["distinctive_features", "unknown_attributes", "ambiguous_attributes", "overall_confidence"]:
                continue
            if key in ["face", "eyes", "eyebrows", "nose", "mouth", "jaw", "chin", "hair", "facial_hair"] and isinstance(val, dict):
                continue
            if isinstance(val, (str, int, float, bool)):
                str_val = str(val).strip()
                if not str_val:
                    continue
                if key in key_to_domain:
                    dom, sub_k = key_to_domain[key]
                    getattr(schema, dom)[sub_k] = AttributeValue(
                        value=str_val,
                        confidence=default_confidence,
                        source="explicit",
                    )
                else:
                    # Check prefix like "eyes_shape"
                    parts = key.split("_", 1)
                    if len(parts) == 2 and parts[0] in ["face", "eyes", "eyebrows", "nose", "mouth", "jaw", "chin", "hair", "facial_hair"]:
                        getattr(schema, parts[0])[parts[1]] = AttributeValue(
                            value=str_val,
                            confidence=default_confidence,
                            source="explicit",
                        )

        # Handle distinctive features
        df = data.get("distinctive_features")
        if isinstance(df, list):
            for item in df:
                if isinstance(item, dict) and "value" in item:
                    schema.distinctive_features.append(
                        AttributeValue(
                            value=str(item["value"]),
                            confidence=float(item.get("confidence", default_confidence)),
                            source=item.get("source", "explicit"),
                        )
                    )
                elif isinstance(item, str) and item.strip():
                    schema.distinctive_features.append(
                        AttributeValue(
                            value=item.strip(),
                            confidence=default_confidence,
                            source="explicit",
                        )
                    )

        if "overall_confidence" in data and isinstance(data["overall_confidence"], (int, float)):
            schema.overall_confidence = float(data["overall_confidence"])

        return schema
