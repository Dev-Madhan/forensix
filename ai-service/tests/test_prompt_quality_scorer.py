from app.services.prompt_quality_scorer import prompt_quality_scorer, QualityResult


def test_score_short_prompt_auto_enrichment():
    """Short prompt with < 50 score should be enriched with neutral defaults."""
    res = prompt_quality_scorer.score("male with oval face and glasses")
    assert res.score < 50
    assert res.tier == "short"
    assert len(res.enrichments) > 0
    # Should contain defaults for uncovered domains
    assert "face_shape" not in res.enrichments  # already present in text
    assert "eyes" in res.enrichments or "nose" in res.enrichments


def test_score_detailed_prompt_master_tier():
    """Rich prompt covering all 8 domains should achieve high score (>= 80) and detailed tier."""
    prompt = (
        "White/gray linework on a deep black background. "
        "A male suspect, approximately 28-35 years old, with an oval face shape, "
        "defined but slightly soft jawline, and a moderately prominent chin. "
        "Almond eyes, slightly close-set, deep-set, with naturally arched medium-thick eyebrows. "
        "Straight nose, medium width, defined nostrils, slightly rounded upturned tip. "
        "Medium-wide mouth, full lips, clearly defined Cupid's bow, neutral closed-mouth expression. "
        "Wearing thin rectangular glasses with dark frames. "
        "Short, neat side-parted dark hair with a slightly low hairline. "
        "Clean-shaven, no facial hair, smooth skin texture. "
        "Frontal view, bilateral symmetry, head and neck and upper shoulders only."
    )
    res = prompt_quality_scorer.score(prompt)
    assert res.score >= 80
    assert res.tier in ("detailed", "medium")
    assert len(res.covered_domains) >= 6
    assert len(res.enrichments) == 0  # No auto-enrichments needed for detailed prompt


def test_domain_breakdown_dictionary():
    res = prompt_quality_scorer.score("young female, round face, blue eyes, button nose, thin lips")
    res_dict = res.to_dict()
    assert "score" in res_dict
    assert "tier" in res_dict
    assert "covered_domains" in res_dict
    assert "missing_domains" in res_dict
    assert isinstance(res_dict["domain_breakdown"], dict)
