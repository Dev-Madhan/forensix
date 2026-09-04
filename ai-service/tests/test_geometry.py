from app.services.geometry_service import geometry_service


def test_geometry_service_baseline_anchors():
    attributes = {
        "face_shape": "oval",
        "eyes": {"spacing": "normal"},
        "nose": {"length": "medium", "width": "narrow"},
        "mouth": {"width": "medium"},
    }
    geom = geometry_service.compute_anchors(attributes, resolution=512)
    assert geom.canvas.width == 512
    assert geom.canvas.height == 512

    # Verify standard normalized anchors per guide
    assert geom.anchors.left_eye == [0.36, 0.40]
    assert geom.anchors.right_eye == [0.64, 0.40]
    assert geom.anchors.nose_tip == [0.50, 0.58]
    assert geom.anchors.mouth == [0.50, 0.70]
    assert geom.anchors.chin == [0.50, 0.86]


def test_geometry_service_stability_quality_test():
    """
    Test specified on Page 6 of the guide:
    'Change only nose.width. The eyes, mouth, jaw and face proportions
    should remain stable as far as the conditioning pipeline allows.'
    """
    baseline_attrs = {
        "face_shape": "oval",
        "eyes": {"spacing": "normal"},
        "nose": {"width": "narrow"},
    }
    modified_attrs = {
        "face_shape": "oval",
        "eyes": {"spacing": "normal"},
        "nose": {"width": "wide"},  # ONLY changed nose width
    }

    baseline_geom = geometry_service.compute_anchors(baseline_attrs)
    modified_geom = geometry_service.compute_anchors(modified_attrs)

    # Eyes, mouth, chin must remain identical
    assert baseline_geom.anchors.left_eye == modified_geom.anchors.left_eye
    assert baseline_geom.anchors.right_eye == modified_geom.anchors.right_eye
    assert baseline_geom.anchors.mouth == modified_geom.anchors.mouth
    assert baseline_geom.anchors.chin == modified_geom.anchors.chin


def test_geometry_service_eye_spacing_adjustment():
    wide_attrs = {"eyes": {"spacing": "wide"}}
    wide_geom = geometry_service.compute_anchors(wide_attrs)

    # Eyes should be further apart
    assert wide_geom.anchors.left_eye[0] < 0.36
    assert wide_geom.anchors.right_eye[0] > 0.64
