from __future__ import annotations

from typing import Any, Dict, List, Optional
import re

# ---------------------------------------------------------------------------
# TOKEN → FORENSIC SD DESCRIPTOR LIBRARY
# Every token has a calibrated numerical attention weight (:X.X) so that
# anatomical features dominate over generic style/lighting boilerplate.
# ---------------------------------------------------------------------------
TOKEN_FORENSIC_MAP: Dict[str, str] = {
    # ── Face Shape ──────────────────────────────────────────────────────────
    "oval_face_shape":    "(oval-shaped face:1.3), balanced cranial proportions, gently tapering jawline",
    "round_face_shape":   "(round face shape:1.3), full cheeks, soft curved jawline, balanced facial width",
    "square_face_shape":  "(square face shape:1.3), prominent broad jawline, wide forehead, angular facial architecture",
    "oblong_face_shape":  "(oblong elongated face:1.3), extended vertical cranial profile, narrow uniform facial width",
    "diamond_face_shape": "(diamond face shape:1.3), high angular cheekbones, tapered narrow forehead and pointed chin",
    "heart_face_shape":   "(heart-shaped face:1.3), wide cranial forehead, tapering dramatically to narrow chin",

    # ── Jawline ─────────────────────────────────────────────────────────────
    "soft_jawline":    "(soft gentle jawline:1.2), smooth continuous bone definition, rounded lower mandible",
    "rounded_jawline": "(rounded jawline:1.2), smooth gradual curvature from earlobe to chin",
    "angular_jawline": "(sharp chiseled jawline:1.3), defined mandible bone structure, acute gonial angle",
    "wide_jawline":    "(wide broad jawline:1.2), prominent lateral mandible width, sturdy lower facial frame",
    "narrow_jawline":  "(narrow jawline:1.2), compressed mandible width, steep inward jaw taper",
    "square_jawline":  "(square strong jawline:1.3), horizontal mandibular base with crisp right-angle corners",

    # ── Chin ────────────────────────────────────────────────────────────────
    "rounded_chin":      "(rounded soft chin:1.2), gentle convex mental curve",
    "pointed_chin":      "(pointed chin:1.2), prominent triangular mental protuberance, sharp chin apex",
    "broad_chin":        "(broad wide chin:1.2), horizontal mental base with bilateral tubercles",
    "narrow_chin":       "(narrow chin:1.2), compact pinched mental apex",
    "square_chin":       "(square chin:1.2), flat horizontal mental base with defined corners",
    "receding_chin":     "(receding chin:1.2), retruded mental position posterior to facial line",
    "cleft_chin_dimple": "(cleft chin:1.2), central vertical dimple furrow on mental protuberance",
    "moderately_prominent_chin": "(moderately prominent rounded chin:1.3), defined mental protuberance with gentle convex curve",

    # ── Eyes ────────────────────────────────────────────────────────────────
    "almond_eyes":    "(almond-shaped eyes:1.3), classic tapered outer canthus, symmetrical eyelids",
    "round_eyes":     "(round wide eyes:1.3), prominent palpebral opening, visible white sclera around iris",
    "narrow_eyes":    "(narrow slender eyes:1.3), compressed horizontal palpebral aperture",
    "large_eyes":     "(large expressive eyes:1.3), expansive ocular aperture, prominent iris",
    "small_eyes":     "(small compact eyes:1.2), narrow orbital opening",
    "deep_set_eyes":  "(deep-set eyes:1.4) recessed beneath prominent supraorbital brow ridge, shadowed orbital region",
    "close_set_eyes": "(close-set eyes:1.35), narrow intercanthal distance close to nasal bridge",
    "normal_set_eyes":"standard proportional intercanthal distance between eyes",
    "wide_set_eyes":  "(wide-set eyes:1.3), broad intercanthal distance spaced across nasal bridge",
    "upturned_eyes":  "(upturned eyes:1.2), lateral canthus elevated, positive canthal tilt",
    "downturned_eyes":"(downturned eyes:1.2), outer lateral canthus sloping downward, negative canthal tilt",
    "medium_almond_eyes": "(medium-sized almond-shaped eyes:1.35), balanced palpebral fissure, tapered outer canthus",
    "neutral_focused_gaze": "(neutral focused gaze:1.3), direct forward-looking eyes, calm composed stare",

    # ── Eyebrows ────────────────────────────────────────────────────────────
    "straight_eyebrows":    "(straight horizontal eyebrows:1.2), flat brow arch",
    "arched_eyebrows":      "(arched curved eyebrows:1.3), defined peak above pupil",
    "thick_eyebrows":       "(thick bushy eyebrows:1.35), dense brow hair texture",
    "thin_eyebrows":        "(thin finely groomed eyebrows:1.2), narrow brow contour",
    "high_set_eyebrows":    "(high-set eyebrows:1.2), elevated on the frontal bone",
    "low_set_eyebrows":     "(low-set heavy eyebrows:1.3), resting closely above ocular orbits",
    "medium_thick_eyebrows":"(medium-thick naturally arched eyebrows:1.3), moderate brow density, natural gentle arch above pupil",
    "natural_arched_eyebrows":"(naturally arched eyebrows:1.3), organic gentle curve, medium brow thickness",

    # ── Nose ────────────────────────────────────────────────────────────────
    "straight_nose":         "(straight nose:1.3), smooth nasal dorsum, balanced bridge and tip",
    "aquiline_roman_nose":   "(aquiline roman nose:1.3), convex curved nasal bridge, strong hooked profile",
    "upturned_nose":         "(upturned nose:1.3), elevated nasal tip with visible nostril curve",
    "broad_nose":            "(broad wide nose:1.3), expansive nasal bridge and wide alar base",
    "narrow_nose":           "(narrow slender nose:1.3), slim nasal bridge, compact nostrils",
    "bulbous_fleshy_nose":   "(bulbous fleshy nose:1.3), rounded swollen nasal tip",
    "hawk_beaked_nose":      "(hawk-beaked nose:1.3), downward hooked nasal tip, prominent dorsal bridge",
    "broken_deviated_nose":  "(deviated crooked nose:1.3), asymmetrical nasal bridge with healed fracture bump",
    "pointed_nose":          "(pointed sharp nose:1.3), slender elongated nasal tip",
    "rounded_nose":          "(rounded nose:1.2), soft spherical nasal apex",
    "medium_width_straight_nose": "(straight medium-width nose:1.35), smooth nasal dorsum, moderate bridge width, defined nostrils",
    "defined_nostrils":      "(defined nostrils:1.2), clearly visible alar contour, precise nostril openings",
    "slightly_upturned_tip": "(slightly rounded upturned nasal tip:1.3), gentle superior rotation of nasal apex",

    # ── Mouth & Lips ────────────────────────────────────────────────────────
    "full_lips":            "(full voluminous lips:1.3), prominent defined Cupid's bow, balanced upper and lower vermilion",
    "thin_lips":            "(thin compressed lips:1.2), narrow vermilion border",
    "medium_lips":          "(medium proportional lips:1.2), balanced upper and lower vermilion",
    "wide_mouth":           "(wide mouth:1.3), broad oral commissures extending across midface",
    "narrow_mouth":         "(narrow compact mouth:1.2), small commissure span",
    "downturned_mouth":     "(downturned oral commissures:1.2), subdued expression line",
    "cupid_bow_lips":       "(clearly defined Cupid's bow upper lip:1.4), sharp philtrum column, prominent vermilion bow peak",
    "medium_wide_mouth":    "(medium-wide mouth:1.3), balanced oral width, full upper and lower lips",
    "neutral_closed_expression": "(neutral closed-mouth expression:1.4), calm resting face, focused forward gaze, lips gently closed",

    # ── Ears ────────────────────────────────────────────────────────────────
    "regular_ears":   "(normal proportioned ears:1.1), classic helix curve, standard detached earlobe",
    "attached_ears":  "(attached earlobes:1.1), compact ear structure",
    "free_ears":      "(free detached earlobes:1.1), well-defined lower ear margin",
    "protruding_ears":"(protruding ears:1.3), prominent lateral ear projection",
    "pointed_ears":   "(pointed ears:1.2), subtle angular peak at superior helix",
    "narrow_ears":    "(slender narrow ears:1.2), compact elongated auricle",
    "medium_ears":    "(medium-sized regular ears:1.1), standard auricular proportions, balanced helix curve",

    # ── Cheeks & Craniofacial Architecture ─────────────────────────────────
    "high_cheekbones":   "(high prominent cheekbones:1.4), elevated zygomatic arches, sharp cheekbone contours",
    "chubby_cheeks":     "(full rounded cheeks:1.35), chubby facial fullness, soft facial flesh",
    "chubby":            "(full rounded cheeks:1.35), chubby facial fullness, soft facial flesh",
    "double_chin":       "(visible double chin:1.35), submental fat pad beneath jawline",
    "bags_under_eyes":   "(infraorbital eye bags:1.35), prominent bags under eyes, dark lower eyelid circles",

    # ── Neck ────────────────────────────────────────────────────────────────
    "short_neck":     "(short compact neck:1.1), athletic cervical proportions",
    "short_/_compact":"(short compact neck:1.1), athletic cervical proportions",
    "long_neck":      "(extended elongated neck:1.1), slender cervical contour",
    "medium_neck":    "(medium balanced neck:1.1), standard cervical proportions",
    "regular_neck":   "(medium balanced neck:1.1), standard cervical proportions",
    "medium_length_neck": "(medium-length neck:1.2), balanced cervical proportions, upper shoulder area visible",

    # ── Hair & Hairline ─────────────────────────────────────────────────────
    "short_cropped_hair":  "(short cropped hair:1.3), neat uniform side and top cut",
    "buzz_crew_cut_hair":  "(buzz cut crew cut hair:1.3), very short uniform stubble length",
    "medium_layered_hair": "(medium flow layered hair:1.4), natural textured medium length hair",
    "medium_flow":         "(medium flow layered hair:1.4), natural textured medium length hair",
    "hair_medium":         "(medium flow layered hair:1.4), natural textured medium length hair",
    "long_flowing_hair":   "(long flowing hair:1.3), falling past collarbone",
    "wavy_curly_hair":     "(wavy curly textured hair:1.3), organic spiral strands",
    "afro_textured_hair":  "(afro-textured natural hair:1.3), dense kinky coily volume",
    "bald_receded_hair":   "(bald head:1.35), high receding hairline, bare temporal scalp",
    "slicked_back_hair":   "(slicked-back hair:1.3), combed smoothly away from forehead",
    "side_part_hair":      "(side-parted combed hair:1.3), distinct lateral hair separation, neat groomed part",
    "short_side_part_hair":"(short neat side-parted dark hair:1.4), closely cropped sides, clean lateral hair parting from hairline to crown",
    "fade_undercut_hair":  "(fade undercut hairstyle:1.3), cropped sides and textured top",
    "high_hairline":       "(high receding hairline:1.2), wide exposed frontal forehead",
    "low_hairline":        "(low hairline:1.3), descending close above supraorbital brow ridge",
    "slightly_low_hairline":"(slightly low hairline:1.3), hairline positioned modestly close above forehead",
    "bangs_hair":          "(straight blunt fringe bangs:1.3), hair covering forehead",

    # ── Facial Hair ─────────────────────────────────────────────────────────
    "stubble_beard":                    "(heavy stubble beard:1.45), dense dark 5 o'clock shadow stubble across jaw, chin, and upper lip",
    "heavy_stubble":                    "(heavy stubble beard:1.45), dense dark 5 o'clock shadow stubble across jaw, chin, and upper lip",
    "beard_stubble":                    "(heavy stubble beard:1.45), dense dark 5 o'clock shadow stubble across jaw, chin, and upper lip",
    "full_beard":                       "(full dense facial beard:1.45), dark full beard covering lower jaw, chin, and cheeks",
    "goatee_beard":                     "(neat goatee beard:1.4), centered on chin and upper lip",
    "chinstrap_beard":                  "(chinstrap beard:1.4), closely following mandibular jawline with clean cheeks",
    "vandyke_beard":                    "(Van Dyke pointed chin goatee:1.4), disconnected moustache",
    "classic_moustache":                "(classic neat moustache:1.4), along upper lip margin",
    "pencil_thin_moustache":            "(pencil-thin moustache:1.35), closely trimmed along upper lip",
    "handlebar_horseshoe_moustache":    "(handlebar moustache:1.4), downward curved flared ends",
    "thick_chevron_walrus_moustache":   "(heavy thick chevron walrus moustache:1.4), drooping over upper lip",
    "pyramidal_toothbrush_moustache":   "(small pyramidal toothbrush moustache:1.35), centered beneath philtrum",

    # ── Rendering Style Tokens ───────────────────────────────────────────────
    "cross_hatching_texture":   "(subtle pencil cross-hatching:1.3), fine diagonal hatch shading across facial contours and shadow regions",
    "construction_lines":       "(anatomical facial construction lines:1.2), proportional guide marks, forensic measurement grid",
    "bilateral_symmetry":       "(strong bilateral facial symmetry:1.3), natural human imperfections preserved",
    "law_enforcement_style":    "(law enforcement forensic identification sketch:1.5), professional police composite art",

    # ── Eyewear ─────────────────────────────────────────────────────────────
    "thin_wire_rim_glasses":         "(wearing thin wire-rimmed glasses:1.35), delicate oval metallic wire frame spectacles resting over eyes and nasal bridge",
    "thick_black_horn_rim_glasses":  "(wearing thick black horn-rimmed glasses:1.4), bold heavy dark acetate frame eyeglasses over eyes",
    "rectangular_frames_glasses":    "(wearing modern rectangular framed glasses:1.4), angular dark rectangular lens spectacles across ocular region",
    "thin_rectangular_glasses":      "(wearing thin rectangular eyeglasses:1.45), slim dark wire rectangular frames, spectacles resting precisely on nasal bridge over eyes",
    "aviator_wire_glasses":          "(wearing aviator wire frame glasses:1.35), teardrop-shaped metal frame spectacles with straight top brow bar",
    "browline_clubmaster_glasses":   "(wearing browline clubmaster glasses:1.35), bold upper dark acetate browline frame with delicate metallic lower rims",
    "dark_tinted_sunglasses":        "(wearing dark tinted sunglasses:1.4), opaque dark UV lens sunglasses completely shielding the ocular area",
    "glasses_wire_rim":              "(wearing thin wire-rimmed glasses:1.35), delicate oval metallic wire frame spectacles resting over eyes and nasal bridge",
    "glasses_rectangular":           "(wearing modern rectangular framed glasses:1.4), angular dark rectangular lens spectacles across ocular region",
    "glasses_horn_rim":              "(wearing thick black horn-rimmed glasses:1.4), bold heavy dark acetate frame eyeglasses over eyes",
    "glasses_aviator":               "(wearing aviator wire frame glasses:1.35), teardrop-shaped metal frame spectacles with straight top brow bar",
    "glasses_browline":              "(wearing browline clubmaster glasses:1.35), bold upper dark acetate browline frame with delicate metallic lower rims",
    "glasses_sunglasses":            "(wearing dark tinted sunglasses:1.4), opaque dark UV lens sunglasses completely shielding the ocular area",
    "glasses":                       "(wearing glasses, eyeglasses, spectacles:1.35)",
    "eyewear":                       "(wearing glasses, eyeglasses, spectacles:1.35)",

    # ── Headwear ────────────────────────────────────────────────────────────
    "baseball_cap_forward":       "(wearing a baseball cap:1.45), athletic cap facing forward with curved brim",
    "baseball_cap_backwards":     "(wearing a backwards baseball cap:1.5), athletic sports cap worn backwards on head, reversed cap with strap on forehead, hair visible underneath",
    "baseball_cap_(backwards)":   "(wearing a backwards baseball cap:1.5), athletic sports cap worn backwards on head, reversed cap with strap on forehead, hair visible underneath",
    "baseball_cap":               "(wearing a baseball cap:1.45), athletic sports cap on head",
    "knit_beanie_cap":            "(wearing knit beanie cap:1.45), knit beanie pulled over upper forehead",
    "hoodie_pulled_up_hood":      "(wearing hoodie with hood up:1.45), fabric hood pulled up over head",
    "flat_cap_newsboy":           "(wearing tweed flat cap newsboy hat:1.45)",

    # ── Teeth ───────────────────────────────────────────────────────────────
    "crooked_irregular_teeth":  "(crooked irregular misaligned front teeth:1.2)",
    "diastema_gap_teeth":       "(diastema gap between front upper central incisors:1.2)",
    "gold_tooth_crown":         "(visible gold tooth crown dental cap:1.2)",
    "parted_lips_visible_teeth":"(slightly parted lips revealing upper front teeth:1.2)",

    # ── Special Marks & Features ─────────────────────────────────────────────
    "facial_scar":               "(prominent healed linear facial scar:1.3)",
    "cheek_slash_laceration_scar":"(healed slash laceration scar across cheek:1.3)",
    "eyebrow_vertical_scar":     "(vertical notch scar cutting through eyebrow:1.3)",
    "facial_mole":               "(raised dark melanocytic facial mole nevus:1.2)",
    "dense_facial_freckles":     "(dense scattered freckling across nose bridge and upper cheeks:1.2)",
    "teardrop_eye_tattoo":       "(small teardrop tattoo inked below lateral eye corner:1.2)",
    "pierced_nostril_stud_nose": "(small metallic nostril stud piercing on lateral nasal alar:1.2)",
    "facial_tattoo":             "(visible facial tattoo inked on skin:1.2)",
    "temple_cross_tattoo":       "(small dark cross tattoo inked near lateral temple:1.2)",
    "wearing_earrings":          "(wearing small earlobe stud or hoop earrings:1.1)",
    "wearing_necklace":          "(wearing subtle chain necklace around base of neck:1.1)",
    "wearing_necktie":           "(wearing formal collared shirt with knotted necktie:1.1)",
    "bangs_hair":                "(straight blunt fringe bangs:1.2), hair covering forehead",
    "pointy_nose":               "(slender elongated sharp pointed nasal tip:1.2)",

    # ── Female & Universal Contours ──────────────────────────────────────────
    "soft_oval_face_shape":            "(soft oval face shape:1.35), delicate feminine cranial contour, smooth rounded jawline taper",
    "vline_petite_face_shape":         "(v-line face shape:1.4), high angular cheekbones, slender feminine jawline tapering to delicate chin",
    "delicate_tapered_jawline":        "(delicate tapered jawline:1.3), slender feminine jaw with soft continuous curve to chin",
    "chiseled_feminine_jawline":       "(chiseled high cheekbone jawline contour:1.35), sculpted midface with slim mandible",
    "petite_rounded_chin":             "(petite rounded chin:1.3), compact delicate mental apex with smooth contours",
    "delicate_heart_chin":             "(delicate heart-shaped chin:1.3), tapered apex with smooth feminine transition to jawline",
    "high_sculpted_cheekbones":        "(high sculpted cheekbones:1.4), prominent elevated zygomatic arches with delicate lower cheek shadow",
    "apple_cheeks_fullness":           "(youthful apple cheeks:1.35), soft rounded anterior cheek fullness, feminine facial flesh",

    # ── Eyes (Female & Inclusive) ───────────────────────────────────────────
    "cat_eye_canthal_tilt":            "(cat-eye shape:1.4), positive canthal tilt, elongated tapered outer eye corner, winged lashline",
    "doe_eyes_large_round":            "(doe eyes:1.4), large expressive round eyes, wide open palpebral aperture with prominent radiant iris",
    "hooded_eyelids":                  "(hooded eyelids:1.3), soft natural skin fold draping over upper eyelid crease",
    "monolid_epicanthic_fold":         "(monolid eyes:1.4), smooth continuous upper eyelid without crease, epicanthic fold",

    # ── Eyebrows (Female & Groomed) ──────────────────────────────────────────
    "feathered_soft_arched_brows":     "(feathered soft arched eyebrows:1.35), delicate micro-stroke brow texture, natural gentle arch",
    "high_glamour_arched_brows":       "(high glamour arched eyebrows:1.4), sculpted defined arch with clean sharp tail",
    "soft_straight_brows":             "(soft straight youthful eyebrows:1.3), gentle horizontal brow contour, rounded tail",
    "s_shaped_feminine_brows":         "(s-shaped curved feminine eyebrows:1.35), soft inner dip rising into elegant arched peak",

    # ── Nose (Female & Piercings) ───────────────────────────────────────────
    "petite_button_nose":              "(petite button nose:1.4), small delicate bridge, slightly elevated compact rounded tip",
    "slender_sculpted_nose":           "(slender sculpted nose:1.35), thin straight nasal bridge with defined alar wings",
    "septum_ring_piercing":            "(wearing septum ring piercing:1.35), circular metallic barbell through nasal septum",

    # ── Mouth & Lips (Female & Defined) ─────────────────────────────────────
    "defined_cupids_bow_lips":         "(defined Cupid's bow lips:1.45), sharp twin peaks on upper vermilion, full pouty lips",
    "pillowy_plump_full_lips":         "(pillowy plump full lips:1.4), voluminous cushions with soft natural vertical creases",
    "petite_rosebud_lips":             "(petite rosebud lips:1.35), compact horizontal mouth width, pronounced central pout",
    "soft_natural_lips":               "(soft natural lips:1.3), delicate vermilion definition with balanced feminine contours",

    # ── Hairstyles (Female & Inclusive) ─────────────────────────────────────
    "sleek_chin_length_bob_hair":      "(sleek chin-length bob hairstyle:1.4), sharp blunt jawline bob, face-framing hair",
    "textured_pixie_crop_hair":        "(textured pixie crop hairstyle:1.4), chic short feminine crop, wispy brow fringe and soft sideburns",
    "high_sleek_ponytail_hair":        "(high sleek ponytail hairstyle:1.45), hair pulled back into high ponytail, exposed temples and neck",
    "curtain_bangs_layered_hair":      "(curtain bangs layered hairstyle:1.4), center-parted face-framing fringe sweeping outward with soft layers",
    "sleek_straight_center_part_hair": "(sleek straight long hair:1.4), clean center part, glossy straight strands falling past shoulders",
    "shoulder_length_wavy_lob_hair":   "(shoulder-length wavy lob hairstyle:1.4), textured long bob with loose effortless waves",
    "blunt_fringe_bangs_long_hair":    "(blunt fringe bangs with long hair:1.4), horizontal brow-skimming bangs and flowing hair",
    "afro_puffs_space_buns_hair":      "(afro puffs space buns hairstyle:1.45), twin voluminous spherical textured afro puffs on crown",
    "box_braids_cornrows_hair":        "(box braids cornrows hairstyle:1.45), neat geometric scalp partings with long braided cords",
    "textured_dreadlocks_hair":        "(textured dreadlocks hairstyle:1.4), defined loc cords framing face and shoulders",
    "widows_peak_hairline":            "(widow's peak hairline:1.3), distinct V-shaped downward frontal hairline point",

    # ── Beauty Marks & Piercings ─────────────────────────────────────────────
    "monroe_lip_beauty_mark":          "(Monroe beauty mark:1.35), small dark circular mole situated above the upper left lip",
    "cheek_beauty_mark":               "(cheek beauty mark:1.35), small dark mole on the upper zygomatic cheekbone",
    "delicate_soft_facial_freckles":   "(delicate soft freckles:1.3), fine ephelides dusting across nasal bridge and under-eye area",
    "nostril_stud_piercing":           "(wearing nose stud piercing:1.35), small metallic stud on nostril alar rim",
    "lip_labret_piercing":             "(wearing lip labret piercing:1.35), small metallic stud centered below lower lip",
    "eyebrow_ring_piercing":           "(wearing eyebrow piercing:1.35), dual-ball curved barbell through outer eyebrow arch",
}


# ---------------------------------------------------------------------------
# AGE-GRADED BIOLOGICAL MARKERS
# ---------------------------------------------------------------------------
AGE_MORPHOMETRICS: Dict[str, Dict[str, Any]] = {
    "18-25": {
        "descriptor": "young adult suspect aged 18 to 25, firm taut skin, high dermal collagen, smooth forehead, tight jawline, no wrinkles",
        "markers": ["Firm dermal elasticity", "Smooth periorbital area", "Tight mandibular margin", "Juvenile cheek fat volume"],
        "lines": "smooth skin, unwrinkled complexion",
    },
    "26-35": {
        "descriptor": "adult suspect aged 26 to 35, fully matured facial bone structure, defined mandibular angle, faint expression lines",
        "markers": ["Adult cranial baseline", "Subtle dynamic expression lines", "Sharp mandibular bone contour", "Balanced sub-orbital tone"],
        "lines": "subtle natural skin texture",
    },
    "36-50": {
        "descriptor": "middle-aged suspect aged 36 to 50, emerging crow's feet wrinkles at eye corners, visible nasolabial folds from nose to mouth, subtle brow furrows",
        "markers": ["Lateral periorbital crow's feet", "Defined nasolabial creases", "Corrugator glabellar lines", "Mild midface volume loss"],
        "lines": "crow's feet wrinkles, defined nasolabial folds, forehead creases",
    },
    "50+": {
        "descriptor": "mature older suspect aged 50 and above, deep transverse forehead wrinkles, pronounced nasolabial folds, prominent marionette lines, periorbital hollowing, aging skin texture",
        "markers": ["Deep frontal forehead furrows", "Pronounced nasolabial grooves", "Mandibular marionette lines", "Infraorbital eye bags and skin laxity"],
        "lines": "deep forehead wrinkles, heavy nasolabial folds, sagging jawline, mature weathered skin",
    },
}


# ---------------------------------------------------------------------------
# CAMERA PERSPECTIVE DIRECTIVES
# ---------------------------------------------------------------------------
CAMERA_PERSPECTIVE_DIRECTIVES: Dict[str, Dict[str, Any]] = {
    "frontal": {
        "prompt": "(direct frontal mugshot view:1.4), perfectly centered en-face portrait, single centered face, direct forward gaze, head and neck upper shoulder area",
        "negative": "side profile, 3/4 angle, turned head, asymmetric tilt, tilted face, two faces, side by side, duplicate head",
        "description": "Frontal (0° En Face Mugshot)",
        "yaw": 0.0,
    },
    "three_quarter": {
        "prompt": "(three-quarter angle portrait:1.3), 45-degree head turn, asymmetric perspective, prominent cheekbone contour, jawline depth visible, angled nose bridge",
        "negative": "direct frontal symmetrical face, strict 90 degree side profile, two faces, side by side",
        "description": "Three-Quarter (45° Oblique Perspective)",
        "yaw": 45.0,
    },
    "profile": {
        "prompt": "(strict 90-degree lateral side profile:1.4), silhouette of face, projecting nasal bridge and tip silhouette, clean jawline angle to ear, single visible eye in profile, lips profile silhouette",
        "negative": "two eyes visible, frontal face, front-facing mouth, three quarter turn, symmetrical face, two faces",
        "description": "Side Profile (90° Strict Lateral)",
        "yaw": 90.0,
    },
}


# ---------------------------------------------------------------------------
# SKETCH STYLE DIRECTIVES  — updated with per-style CFG & step recommendations
# ---------------------------------------------------------------------------
STYLE_DIRECTIVES: Dict[str, Dict[str, Any]] = {
    "Forensic Graphite (Pencil)": {
        "prompt": "(single person:1.6), (solo:1.6), (single face:1.6), (authentic forensic graphite sketch:1.4), official police composite drawing, (sharp 2B pencil linework:1.3), fine cross-hatching shading, paper grain texture, monochrome graphite on clean white background",
        "negative": "color, painted, photorealistic, 3d render, digital glossy, charcoal smudges, muddy dark skin patches",
        "cfg": 9.0,
        "control_weight": 0.25,
        "steps_standard": 28,
        "steps_master": 45,
        "steps_draft": 16,
    },
    "Realistic Charcoal": {
        "prompt": "(single person:1.6), (solo:1.6), (single face:1.6), (realistic forensic charcoal pencil portrait:1.4), soft graphite and charcoal shading on white paper, smooth tonal transitions, textured fine art drawing, law enforcement composite art",
        "negative": "color, vector lineart, smooth digital airbrush, oversaturated dark skin smudges, muddy black skin",
        "cfg": 8.5,
        "control_weight": 0.25,
        "steps_standard": 28,
        "steps_master": 45,
        "steps_draft": 16,
    },
    "Digital Identi-Kit (Lineart)": {
        "prompt": "(single person:1.6), (solo:1.6), (single face:1.6), (digital forensic identi-kit lineart:1.5), high-contrast black vector ink lines, clean anatomical contours, zero skin shading, pure black line art on plain white background, FBI reference drawing",
        "negative": "shading, gradients, pencil smudges, charcoal dust, photorealistic, color, skin tones",
        "cfg": 10.0,
        "control_weight": 0.35,
        "steps_standard": 30,
        "steps_master": 48,
        "steps_draft": 18,
    },
    "Color Age-Progressed": {
        "prompt": "(single person:1.6), (solo:1.6), (single face:1.6), (only one person:1.6), (centered frontal portrait:1.5), (authentic forensic colored composite:1.4), (realistic age progression of an individual:1.3), realistic human skin tone, natural demographic skin pigmentation, realistic hair color, lifelike studio lighting, police composite identification portrait",
        "negative": "(two faces:2.0), (multiple faces:2.0), (two people:2.0), (dual image:2.0), (side by side:2.0), (diptych:2.0), (triptych:2.0), (split image:2.0), (split screen:2.0), (twin:2.0), (twins:2.0), (duplicate:2.0), (cloned face:2.0), (multiple views:2.0), (before and after:2.0), (comparison:2.0), (double portrait:2.0), (extra head:2.0), (two heads:2.0), (second person:2.0), (multiple people:2.0), (group:2.0), (collage:2.0), (photo collage:2.0), cartoon, anime, 3d render, flat monochrome, black and white, grayscale, desaturated, zombie, seam, split face, (extreme closeup:1.5), (cropped face:1.5), (macro:1.5)",
        "cfg": 7.5,
        "control_weight": 0.25,
        "steps_standard": 28,
        "steps_master": 45,
        "steps_draft": 16,
    },
    "Monochrome Inversion (Black Background)": {
        "prompt": "(single person:1.6), (solo:1.6), (single face:1.6), (forensic chalkboard composite sketch:1.6), (crisp monochrome white and light grey chalk pencil linework:1.5), (solid pitch black background:1.8), (law enforcement forensic identification sketch:1.5), (detailed facial contours:1.3), anatomical construction lines, (subtle cross-hatching shading:1.3), accurate facial proportions, clear individual feature definition, natural human imperfections, head neck upper shoulder area only",
        "negative": "(white background:2.0), (light background:2.0), (grey background:1.8), (light gray background:1.8), (cream background:1.8), color, painted, photorealistic, 3d render, digital glossy, frame, picture frame, border, gold, ornate border, (colored lines:1.5)",
        "cfg": 12.0,
        "control_weight": 0.30,
        "steps_standard": 35,
        "steps_master": 50,
        "steps_draft": 20,
    },
}


# ---------------------------------------------------------------------------
# ETHNICITY / DEMOGRAPHIC MATRIX
# ---------------------------------------------------------------------------
ETHNICITY_FORENSIC_MAP: Dict[str, Dict[str, str]] = {
    "General / Neutral": {
        "prompt": "demographically balanced universal facial composite, neutral pencil tones, balanced facial features, unbiased forensic rendering",
        "negative": "extreme dark skin shading, oversaturated skin tone, racial caricature, exaggerated facial proportions, dark blotchy smudges, muddy skin",
        "label": "General / Neutral (Balanced Unbiased Baseline)",
    },
    "Caucasian / European": {
        "prompt": "Caucasian European ancestry subject, European craniofacial morphology, fair light skin tone, balanced nasal bridge",
        "negative": "dark skin, heavy tanning, non-European features",
        "label": "Caucasian / European",
    },
    "East Asian": {
        "prompt": "East Asian ancestry subject, East Asian craniofacial morphology, characteristic epicanthic fold contour, straight dark hair, smooth skin tone",
        "negative": "deep-set Caucasian orbits, African features",
        "label": "East Asian",
    },
    "South Asian": {
        "prompt": "South Asian ancestry subject, South Asian craniofacial architecture, balanced warm olive complexion, distinct almond ocular shape",
        "negative": "pale Nordic skin, African features",
        "label": "South Asian",
    },
    "Hispanic / Latino": {
        "prompt": "Hispanic Latino ancestry subject, Hispanic craniofacial features, warm medium skin tone, balanced facial proportions",
        "negative": "extreme pale skin, exaggerated caricature",
        "label": "Hispanic / Latino",
    },
    "Middle Eastern": {
        "prompt": "Middle Eastern ancestry subject, Mediterranean Middle Eastern craniofacial morphology, prominent defined eyebrows and eye contour",
        "negative": "Nordic features, extreme dark skin",
        "label": "Middle Eastern",
    },
    "African / Black": {
        "prompt": "African diaspora ancestry subject, authentic Afrocentric craniofacial morphology, broad nasal structure, full lips, deep rich skin complexion",
        "negative": "pale Caucasian skin, thin Caucasian nose bridge",
        "label": "African / Black",
    },
}

# Short-prompt neutral defaults injected when < 5 feature tokens are detected
SHORT_PROMPT_DEFAULTS: Dict[str, str] = {
    "face_shape":  "oval_face_shape",
    "eyes":        "almond_eyes",
    "eye_spacing": "normal_set_eyes",
    "nose":        "straight_nose",
    "mouth":       "medium_lips",
    "neck":        "medium_neck",
    "expression":  "neutral_closed_expression",
}


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def resolve_demographic_ethnicity(ethnicity: Optional[str]) -> Dict[str, str]:
    """Normalizes and maps user demographic selection to forensic prompt directives."""
    if not ethnicity:
        return ETHNICITY_FORENSIC_MAP["General / Neutral"]
    low = ethnicity.lower().strip()
    if any(k in low for k in ("neutral", "general", "unspecified", "all", "balanced", "universal")):
        return ETHNICITY_FORENSIC_MAP["General / Neutral"]
    if any(k in low for k in ("caucasian", "white", "european")):
        return ETHNICITY_FORENSIC_MAP["Caucasian / European"]
    if any(k in low for k in ("south asian", "indian", "desi", "pakistani", "bengali")):
        return ETHNICITY_FORENSIC_MAP["South Asian"]
    if any(k in low for k in ("east asian", "asian", "oriental", "japanese", "chinese", "korean")):
        return ETHNICITY_FORENSIC_MAP["East Asian"]
    if any(k in low for k in ("hispanic", "latino", "latina", "latin")):
        return ETHNICITY_FORENSIC_MAP["Hispanic / Latino"]
    if any(k in low for k in ("middle eastern", "arab", "persian", "mediterranean")):
        return ETHNICITY_FORENSIC_MAP["Middle Eastern"]
    if any(k in low for k in ("african", "black", "afro")):
        return ETHNICITY_FORENSIC_MAP["African / Black"]
    return ETHNICITY_FORENSIC_MAP["General / Neutral"]


def _match(text: str, *patterns: str) -> bool:
    """Returns True if ANY of the regex patterns match `text`."""
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)


def extract_features_from_prompt(prompt: Optional[str]) -> Dict[str, Any]:
    """
    Parses unstructured natural language witness statements or investigator prompts
    into structured forensic attribute tokens.

    Improvements over v1:
    - Multi-phrase synonym groups covering hedged/modified language
      (e.g. 'slightly close-set', 'naturally arched', 'moderately prominent')
    - Compound attribute patterns that extract multiple tokens from single phrases
    - Black-background / chalkboard style trigger expanded
    - Short-prompt defaults applied when < 5 tokens are extracted
    - Contradiction resolution: explicit negations win over affirmative mentions
    """
    if not prompt or not prompt.strip():
        return {}

    text = prompt.lower()
    attrs: Dict[str, Any] = {}
    tokens: List[str] = []

    # ── 1. Face Shape ───────────────────────────────────────────────────────
    if _match(text, r'\b(oval|medium.long oval|elongated|long face)\b'):
        attrs["face_shape"] = "oval_face_shape"; tokens.append("oval_face_shape")
    elif _match(text, r'\b(round face|circular face|round oval face)\b'):
        attrs["face_shape"] = "round_face_shape"; tokens.append("round_face_shape")
    elif _match(text, r'\b(square face)\b'):
        attrs["face_shape"] = "square_face_shape"; tokens.append("square_face_shape")
    elif _match(text, r'\b(diamond face)\b'):
        attrs["face_shape"] = "diamond_face_shape"; tokens.append("diamond_face_shape")
    elif _match(text, r'\b(heart[- ]shaped face)\b'):
        attrs["face_shape"] = "heart_face_shape"; tokens.append("heart_face_shape")
    elif _match(text, r'\b(oblong|long narrow face)\b'):
        attrs["face_shape"] = "oblong_face_shape"; tokens.append("oblong_face_shape")

    # ── 2. Jawline ──────────────────────────────────────────────────────────
    if _match(text, r'\b(soft jaw|soft jawline|gentle jawline|slightly soft jawline|defined.{0,20}soft jawline|soft.{0,15}defined jawline)\b'):
        attrs["jawline"] = "soft_jawline"; tokens.append("soft_jawline")
    elif _match(text, r'\b(rounded jaw|rounded jawline)\b'):
        attrs["jawline"] = "rounded_jawline"; tokens.append("rounded_jawline")
    elif _match(text, r'\b(angular jaw|chiseled jaw|sharp jaw|defined jaw)\b'):
        attrs["jawline"] = "angular_jawline"; tokens.append("angular_jawline")
    elif _match(text, r'\b(wide jaw|broad jaw)\b'):
        attrs["jawline"] = "wide_jawline"; tokens.append("wide_jawline")
    elif _match(text, r'\b(square jaw)\b'):
        attrs["jawline"] = "square_jawline"; tokens.append("square_jawline")

    # ── 3. Chin ─────────────────────────────────────────────────────────────
    if _match(text, r'\b(moderately prominent chin|rounded.{0,20}prominent chin|prominent.{0,20}rounded chin)\b'):
        attrs["chin"] = "moderately_prominent_chin"; tokens.append("moderately_prominent_chin")
    elif _match(text, r'\b(rounded chin|round chin|soft chin)\b'):
        attrs["chin"] = "rounded_chin"; tokens.append("rounded_chin")
    elif _match(text, r'\b(pointed chin|sharp chin)\b'):
        attrs["chin"] = "pointed_chin"; tokens.append("pointed_chin")
    elif _match(text, r'\b(broad chin|wide chin)\b'):
        attrs["chin"] = "broad_chin"; tokens.append("broad_chin")
    elif _match(text, r'\b(square chin)\b'):
        attrs["chin"] = "square_chin"; tokens.append("square_chin")
    elif _match(text, r'\b(cleft chin|dimple chin)\b'):
        attrs["chin"] = "cleft_chin_dimple"; tokens.append("cleft_chin_dimple")

    # ── 4a. Hair ────────────────────────────────────────────────────────────
    if _match(text, r'\b(short.{0,20}side.?part|side.?part.{0,20}dark|neat side.?part)\b'):
        attrs["hair"] = "short_side_part_hair"; tokens.append("short_side_part_hair")
    elif _match(text, r'\b(side.?part|side parted)\b'):
        attrs["hair"] = "side_part_hair"; tokens.append("side_part_hair")
    elif _match(text, r'\b(medium\s+flow|medium\s+length\s+hair|medium\s+hair|layered\s+hair|shoulder[- ]length\s+hair|medium\s+textured\s+hair)\b'):
        attrs["hair"] = "medium_layered_hair"; tokens.append("medium_layered_hair")
    elif _match(text, r'\b(short cropped|cropped hair|short dark hair|short neat hair|short hair)\b'):
        attrs["hair"] = "short_cropped_hair"; tokens.append("short_cropped_hair")
    elif _match(text, r'\b(buzz cut|crew cut|military cut)\b'):
        attrs["hair"] = "buzz_crew_cut_hair"; tokens.append("buzz_crew_cut_hair")
    elif _match(text, r'\b(fade|undercut|skin fade|taper fade)\b'):
        attrs["hair"] = "fade_undercut_hair"; tokens.append("fade_undercut_hair")
    elif _match(text, r'\b(long flowing hair|long hair|hair past shoulders)\b'):
        attrs["hair"] = "long_flowing_hair"; tokens.append("long_flowing_hair")
    elif _match(text, r'\b(wavy hair|curly hair|wavy curly|curly)\b'):
        attrs["hair"] = "wavy_curly_hair"; tokens.append("wavy_curly_hair")
    elif _match(text, r'\b(afro|kinky hair|coily hair)\b'):
        attrs["hair"] = "afro_textured_hair"; tokens.append("afro_textured_hair")
    elif _match(text, r'\b(slicked[- ]back|slick hair)\b'):
        attrs["hair"] = "slicked_back_hair"; tokens.append("slicked_back_hair")
    elif _match(text, r'\b(bangs|fringe)\b'):
        attrs["hair"] = "bangs_hair"; tokens.append("bangs_hair")
    elif _match(text, r'\b(bald|balding|shaved head)\b'):
        attrs["hair"] = "bald_receded_hair"; tokens.append("bald_receded_hair")

    # ── 4b. Hairline ────────────────────────────────────────────────────────
    if _match(text, r'\b(slightly low hairline|low hairline|low slightly|low.{0,15}hairline)\b'):
        attrs["hairline"] = "slightly_low_hairline"; tokens.append("slightly_low_hairline")
    elif _match(text, r'\b(high hairline|high receding hairline|receding hairline)\b'):
        attrs["hairline"] = "high_hairline"; tokens.append("high_hairline")

    # ── 4c. Cheeks & Craniofacial Architecture ──────────────────────────────
    if _match(text, r'\b(high cheekbones|prominent cheekbones|angular cheekbones|high zygomatic)\b'):
        attrs["cheekbones"] = "high_cheekbones"; tokens.append("high_cheekbones")
    if _match(text, r'\b(chubby cheeks|chubby face|full cheeks|plump cheeks|chubby)\b'):
        attrs["cheeks"] = "chubby_cheeks"; tokens.append("chubby_cheeks")
    if _match(text, r'\b(double chin|submental fat)\b'):
        attrs["chin_extra"] = "double_chin"; tokens.append("double_chin")
    if _match(text, r'\b(bags under (the )?eyes|eye bags|dark circles under eyes|tired eyes)\b'):
        attrs["eye_bags"] = "bags_under_eyes"; tokens.append("bags_under_eyes")

    # ── 4d. Ears & Neck ─────────────────────────────────────────────────────
    if _match(text, r'\b(protruding ears|sticking out ears|large ears)\b'):
        attrs["ears"] = "protruding_ears"; tokens.append("protruding_ears")
    elif _match(text, r'\b(narrow ears|small ears)\b'):
        attrs["ears"] = "narrow_ears"; tokens.append("narrow_ears")
    elif _match(text, r'\b(medium.{0,10}ears|regular ears|normal ears|proportional ears)\b'):
        attrs["ears"] = "medium_ears"; tokens.append("medium_ears")

    if _match(text, r'\b(short neck|compact neck)\b'):
        attrs["neck"] = "short_neck"; tokens.append("short_neck")
    elif _match(text, r'\b(long neck|slender neck)\b'):
        attrs["neck"] = "long_neck"; tokens.append("long_neck")
    elif _match(text, r'\b(medium.{0,10}neck|regular neck|balanced neck|medium.length neck)\b'):
        attrs["neck"] = "medium_length_neck"; tokens.append("medium_length_neck")

    # ── 5. Eyes ─────────────────────────────────────────────────────────────
    if _match(text, r'\b(medium.{0,10}almond|almond[- ]shaped)\b'):
        attrs["eyes"] = "medium_almond_eyes"; tokens.append("medium_almond_eyes")
    elif _match(text, r'\b(almond)\b'):
        attrs["eyes"] = "almond_eyes"; tokens.append("almond_eyes")
    elif _match(text, r'\b(round eyes)\b'):
        attrs["eyes"] = "round_eyes"; tokens.append("round_eyes")
    elif _match(text, r'\b(narrow eyes)\b'):
        attrs["eyes"] = "narrow_eyes"; tokens.append("narrow_eyes")

    if _match(text, r'\b(slightly close.{0,5}set|close.{0,5}set eyes|close set)\b'):
        attrs["eye_spacing"] = "close_set_eyes"; tokens.append("close_set_eyes")
    elif _match(text, r'\b(wide.{0,5}set eyes|wide set)\b'):
        attrs["eye_spacing"] = "wide_set_eyes"; tokens.append("wide_set_eyes")

    if _match(text, r'\b(deep.?set|recessed eyes|sunken eyes)\b'):
        attrs["eye_depth"] = "deep_set_eyes"; tokens.append("deep_set_eyes")

    if _match(text, r'\b(neutral.{0,20}focused gaze|looking directly forward|direct gaze|direct forward)\b'):
        tokens.append("neutral_focused_gaze")

    if _match(text, r'\b(small eyes|small compact eyes|small almond[- ]shaped)\b'):
        if "eyes" not in attrs:
            attrs["eyes"] = "small_eyes"
        tokens.append("small_eyes")

    # ── 6. Eyebrows ─────────────────────────────────────────────────────────
    if _match(text, r'\b(medium.?thick.{0,20}eyebrows|medium.{0,20}arch|naturally arched|natural arch)\b'):
        attrs["eyebrows"] = "medium_thick_eyebrows"; tokens.append("medium_thick_eyebrows")
    elif _match(text, r'\b(high[- ]set eyebrows|high set eyebrows|high eyebrows)\b'):
        attrs["eyebrows"] = "high_set_eyebrows"; tokens.append("high_set_eyebrows")
    elif _match(text, r'\b(low[- ]set eyebrows|low set eyebrows)\b'):
        attrs["eyebrows"] = "low_set_eyebrows"; tokens.append("low_set_eyebrows")
    elif _match(text, r'\b(thick eyebrows|bushy eyebrows)\b'):
        attrs["eyebrows"] = "thick_eyebrows"; tokens.append("thick_eyebrows")
    elif _match(text, r'\b(thin eyebrows)\b'):
        attrs["eyebrows"] = "thin_eyebrows"; tokens.append("thin_eyebrows")
    elif _match(text, r'\b(arched eyebrows)\b'):
        attrs["eyebrows"] = "arched_eyebrows"; tokens.append("arched_eyebrows")

    # ── 7. Nose ─────────────────────────────────────────────────────────────
    if _match(text, r'\b(straight.{0,20}medium.{0,20}nose|medium.{0,20}straight.{0,20}nose|medium.width.{0,20}bridge)\b'):
        attrs["nose"] = "medium_width_straight_nose"; tokens.append("medium_width_straight_nose")
    elif _match(text, r'\b(straight.*nose)\b'):
        attrs["nose"] = "straight_nose"; tokens.append("straight_nose")

    if _match(text, r'\b(slightly.{0,10}upturned|slightly.{0,10}rounded.{0,10}tip|upturned tip|rounded.{0,10}upturned)\b'):
        if "nose" not in attrs:
            attrs["nose"] = "slightly_upturned_tip"
        tokens.append("slightly_upturned_tip")
    elif _match(text, r'\b(upturned.*nose|turned[- ]up nose)\b'):
        if "nose" not in attrs:
            attrs["nose"] = "upturned_nose"
        tokens.append("upturned_nose")

    if _match(text, r'\b(defined nostrils|prominent nostrils|clear nostrils)\b'):
        tokens.append("defined_nostrils")

    if _match(text, r'\b(broad nose|wide nose)\b'):
        if "nose" not in attrs:
            attrs["nose"] = "broad_nose"
        tokens.append("broad_nose")
    elif _match(text, r'\b(aquiline|roman nose)\b'):
        if "nose" not in attrs:
            attrs["nose"] = "aquiline_roman_nose"
        tokens.append("aquiline_roman_nose")
    elif _match(text, r'\b(pointed nose|sharp nose)\b'):
        if "nose" not in attrs:
            attrs["nose"] = "pointed_nose"
        tokens.append("pointed_nose")

    # ── 8. Mouth & Lips ─────────────────────────────────────────────────────
    if _match(text, r'\b(cupid.{0,5}bow|cupid bow|defined cupid)\b'):
        tokens.append("cupid_bow_lips")
    if _match(text, r'\b(medium.?wide mouth|medium wide)\b'):
        attrs["mouth"] = "medium_wide_mouth"; tokens.append("medium_wide_mouth")
    elif _match(text, r'\b(full lips|voluminous lips|thick lips|full upper.{0,20}lower|full.{0,20}lips)\b'):
        attrs["mouth"] = "full_lips"; tokens.append("full_lips")
    elif _match(text, r'\b(thin lips)\b'):
        attrs["mouth"] = "thin_lips"; tokens.append("thin_lips")
    if _match(text, r'\b(neutral.{0,15}closed.{0,15}mouth|closed.{0,10}mouth expression|lips closed|neutral expression)\b'):
        tokens.append("neutral_closed_expression")

    # ── 9. Eyewear ───────────────────────────────────────────────────────────
    if _match(text, r'\b(thin rectangular|rectangular.{0,25}(glasses|eyeglasses|spectacles|frames)|thin.{0,10}dark.{0,10}frame)\b'):
        attrs["eyewear"] = "thin_rectangular_glasses"; tokens.append("thin_rectangular_glasses")
    elif _match(text, r'\b(wire[- ]rim|thin.*glasses)\b'):
        attrs["eyewear"] = "thin_wire_rim_glasses"; tokens.append("thin_wire_rim_glasses")
    elif _match(text, r'\b(horn[- ]rim|thick black.*glasses)\b'):
        attrs["eyewear"] = "thick_black_horn_rim_glasses"; tokens.append("thick_black_horn_rim_glasses")
    elif _match(text, r'\b(sunglasses|dark glasses|tinted)\b'):
        attrs["eyewear"] = "dark_tinted_sunglasses"; tokens.append("dark_tinted_sunglasses")
    elif _match(text, r'\b(glasses|eyeglasses|spectacles)\b'):
        attrs["eyewear"] = "glasses"; tokens.append("glasses")

    # ── 9b. Headwear ─────────────────────────────────────────────────────────
    if _match(text, r'\b(backwards\s+(baseball\s+)?cap|cap\s+backwards|reverse(d)?\s+cap|backward(s)?\s+cap)\b'):
        attrs["headwear"] = "baseball_cap_backwards"; tokens.append("baseball_cap_backwards")
    elif _match(text, r'\b(baseball\s+cap|ball\s+cap|trucker\s+hat)\b'):
        attrs["headwear"] = "baseball_cap_forward"; tokens.append("baseball_cap_forward")
    elif _match(text, r'\b(knit\s+beanie|beanie|winter\s+hat|skull\s+cap|toque)\b'):
        attrs["headwear"] = "knit_beanie_cap"; tokens.append("knit_beanie_cap")
    elif _match(text, r'\b(hoodie|hood\s+up|pulled\s+up\s+hood|hooded\s+sweatshirt)\b'):
        attrs["headwear"] = "hoodie_pulled_up_hood"; tokens.append("hoodie_pulled_up_hood")
    elif _match(text, r'\b(flat\s+cap|newsboy\s+cap|tweed\s+cap)\b'):
        attrs["headwear"] = "flat_cap_newsboy"; tokens.append("flat_cap_newsboy")

    # ── 10. Facial Hair (with contradiction resolution) ─────────────────────
    explicit_clean = _match(text,
        r'\b(clean[- ]shaven|no beard|no moustache|no mustache|no facial hair|without beard)\b',
        r'\b(no beard or moustache|not bearded|unbearded)\b')
    has_positive_hair = _match(text,
        r'\b(heavy stubble|rough stubble|5 o\'clock shadow|stubble beard|stubble)\b',
        r'\b(full beard|heavy beard|thick beard)\b',
        r'\b(goatee|chin goatee)\b',
        r'\b(moustache|mustache)\b')

    # Contradiction resolution: explicit negation beats positive mention
    if explicit_clean and not (has_positive_hair and not explicit_clean):
        attrs["facial_hair"] = "clean_shaven"
    elif _match(text, r'\b(heavy stubble|rough stubble|5 o\'clock shadow|stubble beard|stubble)\b'):
        attrs["facial_hair"] = "stubble_beard"; tokens.append("stubble_beard")
    elif _match(text, r'\b(full beard|heavy beard|thick beard)\b'):
        attrs["facial_hair"] = "full_beard"; tokens.append("full_beard")
    elif _match(text, r'\b(goatee|chin goatee)\b'):
        attrs["facial_hair"] = "goatee_beard"; tokens.append("goatee_beard")
    elif _match(text, r'\b(moustache|mustache)\b'):
        attrs["facial_hair"] = "classic_moustache"; tokens.append("classic_moustache")

    # ── 11. Rendering style tokens from prompt ───────────────────────────────
    if _match(text, r'\b(cross.hatch|cross hatching|hatching|hatch shading)\b'):
        tokens.append("cross_hatching_texture")
    if _match(text, r'\b(construction lines|anatomical lines|proportional lines|guide marks)\b'):
        tokens.append("construction_lines")
    if _match(text, r'\b(bilateral symmetry|symmetric|symmetrical)\b'):
        tokens.append("bilateral_symmetry")
    if _match(text, r'\b(law enforcement|police.{0,10}composite|forensic.{0,10}composite|forensic sketch|forensic identification)\b'):
        tokens.append("law_enforcement_style")

    # ── 12. Demographic: Age & Gender ───────────────────────────────────────
    age_match = re.search(r'(\d{1,2})[-–](\d{1,2})[- ]year[- ]old', text)
    if age_match:
        avg_age = (int(age_match.group(1)) + int(age_match.group(2))) / 2
        if avg_age < 26:
            attrs["_inferred_age"] = "18-25"
        elif avg_age <= 35:
            attrs["_inferred_age"] = "26-35"
        elif avg_age <= 50:
            attrs["_inferred_age"] = "36-50"
        else:
            attrs["_inferred_age"] = "50+"
    else:
        # Catch "approximately 28-35" and similar
        age_approx = re.search(r'approximately\s+(\d{1,2})[\s–-]+(\d{1,2})', text)
        if age_approx:
            avg_age = (int(age_approx.group(1)) + int(age_approx.group(2))) / 2
            if avg_age < 26:
                attrs["_inferred_age"] = "18-25"
            elif avg_age <= 35:
                attrs["_inferred_age"] = "26-35"
            elif avg_age <= 50:
                attrs["_inferred_age"] = "36-50"
            else:
                attrs["_inferred_age"] = "50+"

    if _match(text, r'\b(male|man|gentleman|suspect male)\b'):
        attrs["_inferred_gender"] = "Male"
    elif _match(text, r'\b(female|woman|lady)\b'):
        attrs["_inferred_gender"] = "Female"

    # ── 13. Style triggers ───────────────────────────────────────────────────
    if _match(text,
        r'\b(black background|dark background|chalkboard|white.*linework on.*black)\b',
        r'\b(monochrome white.*linework|white.{0,15}grey linework|white linework|crisp.*linework)\b',
        r'\b(white.*gray linework|white.*grey linework|linework on.*deep black|chalk.*dark background)\b',
        r'\b(deep black background|inverted sketch|pitch black)\b'):
        attrs["_inferred_style"] = "Monochrome Inversion (Black Background)"
        attrs["_black_background"] = True

    # ── 14. Short-prompt enrichment ──────────────────────────────────────────
    _token_count = len([t for t in tokens if t])
    if _token_count < 5:
        for attr_key, default_tok in SHORT_PROMPT_DEFAULTS.items():
            if attr_key not in attrs:
                attrs[f"_default_{attr_key}"] = default_tok
                tokens.append(default_tok)

    if tokens:
        attrs["_feature_tokens"] = ", ".join(dict.fromkeys(tokens))  # deduplicate, preserve order

    return attrs


# ---------------------------------------------------------------------------
# FORENSIC LLM ENGINE — 13-level priority prompt assembly
# ---------------------------------------------------------------------------

class ForensicLLMEngine:
    """
    Intelligent forensic reasoning engine that parses facial traits and witness
    descriptions to synthesize fine-tuned anatomical SD prompts.

    v3 changes:
    - 13-level priority hierarchy — anatomical descriptors now outweigh filler
    - Per-style CFG scale and step count from STYLE_DIRECTIVES
    - Weighted CLIP chunk encoding hint (separator injection)
    - Hardened negative prompts for Monochrome Inversion style
    - Short-prompt auto-enrichment via SHORT_PROMPT_DEFAULTS
    """

    @classmethod
    def analyze(
        cls,
        attributes: Dict[str, Any],
        sketch_style: str = "Forensic Graphite (Pencil)",
        camera_angle: str = "frontal",
        age_group: str = "26-35",
        gender: str = "Male",
        ethnicity: Optional[str] = "General / Neutral",
        lighting_mood: Optional[str] = "neutral_studio",
        detail_level: Optional[str] = "Standard",
        witness_statement: Optional[str] = None,
    ) -> Dict[str, Any]:

        # ── 0. Multi-Source Feature Extraction & Corroborative Fusion ─────────
        parsed_prompt_attrs = extract_features_from_prompt(witness_statement)
        prompt_tokens_set = set(
            tok.strip() for tok in parsed_prompt_attrs.get("_feature_tokens", "").split(",") if tok.strip()
        )

        ui_tokens_set: set = set()
        if "_feature_tokens" in attributes and isinstance(attributes["_feature_tokens"], str):
            for t in attributes["_feature_tokens"].split(","):
                clean = t.strip().lower()
                if clean:
                    ui_tokens_set.add(clean)
        for k, v in attributes.items():
            if not k.startswith("_") and isinstance(v, str):
                v_clean = v.strip().lower()
                if v_clean in TOKEN_FORENSIC_MAP:
                    ui_tokens_set.add(v_clean)

        corroborated_tokens = sorted(list(prompt_tokens_set.intersection(ui_tokens_set)))

        # Merge: parsed prompt attrs override stale UI defaults
        effective_attributes: Dict[str, Any] = dict(attributes)
        for k, v in parsed_prompt_attrs.items():
            if k == "_feature_tokens":
                continue
            effective_attributes[k] = v

        all_tokens = list(dict.fromkeys(list(ui_tokens_set) + list(prompt_tokens_set)))
        effective_attributes["_feature_tokens"] = ", ".join(all_tokens)
        effective_attributes["_corroborated_tokens"] = ", ".join(corroborated_tokens)

        # Auto-align style when witness statement requests black background
        effective_style = sketch_style
        if sketch_style == "Forensic Graphite (Pencil)" and "_inferred_style" in parsed_prompt_attrs:
            effective_style = parsed_prompt_attrs["_inferred_style"]
        if "black background" in effective_style.lower() or "chalkboard" in effective_style.lower() or "inversion" in effective_style.lower():
            effective_attributes["_black_background"] = True
            effective_attributes["sketch_style"] = effective_style

        effective_age = age_group
        if age_group == "26-35" and "_inferred_age" in parsed_prompt_attrs:
            effective_age = parsed_prompt_attrs["_inferred_age"]

        effective_gender = gender
        if gender in ("Male", "Unspecified") and "_inferred_gender" in parsed_prompt_attrs:
            effective_gender = parsed_prompt_attrs["_inferred_gender"]

        # ── 1. Resolve Style ─────────────────────────────────────────────────
        style_info = STYLE_DIRECTIVES.get(effective_style, STYLE_DIRECTIVES["Forensic Graphite (Pencil)"])

        # ── 2. Resolve Perspective ───────────────────────────────────────────
        angle_info = CAMERA_PERSPECTIVE_DIRECTIVES.get(camera_angle, CAMERA_PERSPECTIVE_DIRECTIVES["frontal"])

        # ── 3. Resolve Age & Demographics ───────────────────────────────────
        is_color_style = bool(
            effective_style == "Color Age-Progressed" or "color" in effective_style.lower()
        )
        age_info = AGE_MORPHOMETRICS.get(effective_age, AGE_MORPHOMETRICS["26-35"])
        eth_info = resolve_demographic_ethnicity(ethnicity)

        demo_tokens: List[str] = []
        if effective_gender and effective_gender != "Unspecified":
            demo_tokens.append(f"forensic facial composite of an adult {effective_gender.lower()}")
        else:
            demo_tokens.append("forensic facial composite portrait of an adult subject")
        demo_tokens.append(age_info["descriptor"])
        eth_prompt = eth_info["prompt"]
        if is_color_style:
            eth_prompt = eth_prompt.replace("neutral pencil tones", "natural healthy skin color, lifelike warm skin tones")
        demo_tokens.append(eth_prompt)
        demographics_phrase = ", ".join(demo_tokens)

        # ── 4. Extract and resolve all feature tokens ─────────────────────────
        resolved_features: Dict[str, str] = {}
        feature_descriptors_by_priority: Dict[int, List[str]] = {i: [] for i in range(10)}
        raw_tokens_found: List[str] = []

        # Priority buckets for anatomical descriptors
        FACE_SHAPE_TOKENS = {"oval_face_shape", "round_face_shape", "square_face_shape",
                             "oblong_face_shape", "diamond_face_shape", "heart_face_shape"}
        EYE_TOKENS = {"almond_eyes", "round_eyes", "narrow_eyes", "large_eyes", "small_eyes",
                      "deep_set_eyes", "close_set_eyes", "normal_set_eyes", "wide_set_eyes",
                      "upturned_eyes", "downturned_eyes", "medium_almond_eyes", "neutral_focused_gaze"}
        EYEBROW_TOKENS = {"straight_eyebrows", "arched_eyebrows", "thick_eyebrows", "thin_eyebrows",
                          "high_set_eyebrows", "low_set_eyebrows", "medium_thick_eyebrows",
                          "natural_arched_eyebrows"}
        NOSE_TOKENS = {"straight_nose", "aquiline_roman_nose", "upturned_nose", "broad_nose",
                       "narrow_nose", "bulbous_fleshy_nose", "hawk_beaked_nose", "broken_deviated_nose",
                       "pointed_nose", "rounded_nose", "medium_width_straight_nose",
                       "defined_nostrils", "slightly_upturned_tip", "pointy_nose"}
        MOUTH_TOKENS = {"full_lips", "thin_lips", "medium_lips", "wide_mouth", "narrow_mouth",
                        "downturned_mouth", "cupid_bow_lips", "medium_wide_mouth", "neutral_closed_expression"}
        HAIR_TOKENS = {"short_cropped_hair", "buzz_crew_cut_hair", "medium_layered_hair",
                       "medium_flow", "hair_medium", "long_flowing_hair", "wavy_curly_hair",
                       "afro_textured_hair", "bald_receded_hair", "slicked_back_hair",
                       "side_part_hair", "short_side_part_hair", "fade_undercut_hair",
                       "high_hairline", "low_hairline", "slightly_low_hairline", "bangs_hair"}

        def _token_priority(tok: str) -> int:
            """Returns 0 (face shape) → 6 (hair) priority bucket."""
            if tok in FACE_SHAPE_TOKENS: return 0
            if tok in EYE_TOKENS or tok in EYEBROW_TOKENS: return 1
            if tok in NOSE_TOKENS: return 2
            if tok in MOUTH_TOKENS: return 3
            if tok in HAIR_TOKENS: return 4
            return 5  # cheekbones, jaw, chin, neck, ears, marks etc.

        all_effective_tokens = [t.strip() for t in effective_attributes.get("_feature_tokens", "").split(",") if t.strip()]
        for tok in all_effective_tokens:
            if tok in TOKEN_FORENSIC_MAP:
                desc = TOKEN_FORENSIC_MAP[tok]
                priority = _token_priority(tok)
                if desc not in feature_descriptors_by_priority[priority]:
                    feature_descriptors_by_priority[priority].append(desc)
                raw_tokens_found.append(tok)

        for key, val in effective_attributes.items():
            if key.startswith("_") or key.endswith("_name"):
                continue
            if isinstance(val, str):
                tok = val.strip().lower()
                if tok in TOKEN_FORENSIC_MAP:
                    desc = TOKEN_FORENSIC_MAP[tok]
                    priority = _token_priority(tok)
                    if desc not in feature_descriptors_by_priority[priority]:
                        feature_descriptors_by_priority[priority].append(desc)
                    if tok not in raw_tokens_found:
                        raw_tokens_found.append(tok)
                    resolved_features[key] = tok
                elif tok not in ("clean_shaven", "none", "unknown"):
                    resolved_features[key] = tok

        # Flatten priority-ordered feature descriptors (face shape → eyes → nose → mouth → hair → rest)
        ordered_feature_descriptors: List[str] = []
        for priority in range(6):
            ordered_feature_descriptors.extend(feature_descriptors_by_priority[priority])

        # ── 4b. Detect accessories ───────────────────────────────────────────
        has_glasses = False
        detected_glasses_label = ""
        for tok in raw_tokens_found:
            if any(term in tok for term in ("glasses", "eyewear", "sunglasses", "spectacles")):
                has_glasses = True; detected_glasses_label = tok; break
        if not has_glasses:
            for k in ("eyewear", "glasses", "accessories"):
                if k in effective_attributes and isinstance(effective_attributes[k], str) and effective_attributes[k].strip().lower() not in ("", "none"):
                    has_glasses = True; detected_glasses_label = effective_attributes[k].strip().lower(); break

        has_headwear = False
        detected_headwear_label = ""
        for tok in raw_tokens_found:
            if any(term in tok for term in ("cap", "hat", "beanie", "hood", "headwear")):
                has_headwear = True; detected_headwear_label = tok; break
        if not has_headwear:
            for k in ("headwear", "hat", "cap"):
                if k in effective_attributes and isinstance(effective_attributes[k], str) and effective_attributes[k].strip().lower() not in ("", "none"):
                    has_headwear = True; detected_headwear_label = effective_attributes[k].strip().lower(); break

        has_facial_hair = any(
            any(term in tok for term in ("stubble", "beard", "moustache", "mustache", "goatee", "chinstrap", "vandyke"))
            for tok in raw_tokens_found
        )
        is_clean_shaven = bool(
            not has_facial_hair and (
                effective_attributes.get("facial_hair") == "clean_shaven"
                or (witness_statement and re.search(r'\b(clean[- ]shaven|no beard|no moustache|no mustache|no facial hair)\b', witness_statement.lower()))
            )
        )

        is_black_bg = bool(
            effective_attributes.get("_black_background")
            or "black background" in effective_style.lower()
            or "inversion" in effective_style.lower()
            or (witness_statement and re.search(
                r'\b(black background|dark background|chalkboard|white.*linework|pitch black|deep black)\b',
                witness_statement.lower()))
        )

        # ── 5. Detail level → steps ───────────────────────────────────────────
        step_key = {
            "Master": "steps_master",
            "Draft":  "steps_draft",
        }.get(detail_level or "Standard", "steps_standard")
        steps = style_info.get(step_key, 28)
        cfg = style_info["cfg"]

        if detail_level == "Master":
            detail_prompt = "(master forensic composite:1.3), ultra-high anatomical detail, fine 2B graphite hatching, crisp iris striations, maximum structural precision"
        elif detail_level == "Draft":
            detail_prompt = "rapid forensic impression sketch, confident expressive contour strokes"
        else:
            detail_prompt = "standard police identification composite, clean proportional shading, anatomical fidelity"

        # ── 6. Lighting ──────────────────────────────────────────────────────
        if lighting_mood == "crime_scene":
            lighting_prompt = "harsh directional crime-scene light, high contrast"
        else:
            lighting_prompt = "flat neutral studio lighting, even forensic illumination, no dramatic shadows"

        # ══════════════════════════════════════════════════════════════════════
        # 7. ASSEMBLE MASTER POSITIVE PROMPT — 13-Level Priority Hierarchy
        # ══════════════════════════════════════════════════════════════════════
        prompt_parts: List[str] = []

        # Priority 0: RENDERING STYLE + BACKGROUND (highest SD attention — must dominate)
        if is_black_bg:
            prompt_parts.append(style_info["prompt"])  # full monochrome chalkboard block
        elif is_color_style:
            prompt_parts.append(
                "(single person:1.6), (solo:1.6), (single face:1.6), (only one person:1.6), (centered frontal portrait:1.5), "
                "(authentic forensic colored composite:1.4), (realistic age progression of an individual:1.3), "
                "realistic human skin tone, natural demographic skin pigmentation, realistic hair color, lifelike studio lighting, "
                "law enforcement composite identification portrait"
            )
        else:
            prompt_parts.append(style_info["prompt"])

        # Priority 1: VIEW + SYMMETRY
        prompt_parts.append(angle_info["prompt"])

        # Priority 2: FACE SHAPE (craniofacial architecture)
        prompt_parts.extend(feature_descriptors_by_priority[0])  # face shape tokens

        # Priority 3: EYE REGION (eyes + eyebrows + deep-set)
        prompt_parts.extend(feature_descriptors_by_priority[1])  # eye + eyebrow tokens

        # Priority 4: NOSE
        prompt_parts.extend(feature_descriptors_by_priority[2])  # nose tokens

        # Priority 5: MOUTH + LIPS
        prompt_parts.extend(feature_descriptors_by_priority[3])  # mouth tokens

        # Priority 6: ACCESSORIES — glasses (high weight, must appear)
        if has_glasses:
            is_corrob_gl = any("glasses" in t or "spectacles" in t for t in corroborated_tokens)
            gl_weight = "1.5" if (is_corrob_gl or "rectangular" in detected_glasses_label) else "1.4"
            if "rectangular" in detected_glasses_label or "thin_rectangular" in detected_glasses_label:
                prompt_parts.append(f"(wearing thin rectangular eyeglasses:{gl_weight}), slim dark wire rectangular frames precisely over eyes and nasal bridge, rectangular lens spectacles")
            elif "sunglasses" in detected_glasses_label or "tinted" in detected_glasses_label:
                prompt_parts.append(f"(wearing dark tinted sunglasses:{gl_weight}), opaque UV shielding lenses covering eyes")
            else:
                prompt_parts.append(f"(wearing glasses, eyeglasses, spectacles:{gl_weight}), spectacles frames resting over eyes and nose bridge")

        # Priority 6b: HEADWEAR
        if has_headwear:
            is_corrob_cap = any("cap" in t or "beanie" in t or "hat" in t for t in corroborated_tokens)
            hw_weight = "1.55" if (is_corrob_cap or "backwards" in detected_headwear_label) else "1.45"
            if "backwards" in detected_headwear_label or "reverse" in detected_headwear_label:
                prompt_parts.append(f"(wearing a backwards baseball cap:{hw_weight}), athletic sports cap worn backwards on head with rear closure strap visible in front, hair visible underneath")
            elif "beanie" in detected_headwear_label:
                prompt_parts.append(f"(wearing knit beanie cap:{hw_weight}), snug knit beanie covering crown of head")
            else:
                prompt_parts.append(f"(wearing a baseball cap:{hw_weight}), athletic cap on head")

        # Priority 7: HAIR + HAIRLINE
        prompt_parts.extend(feature_descriptors_by_priority[4])  # hair tokens

        # Priority 7b: FACIAL HAIR / CLEAN-SHAVEN
        if has_facial_hair:
            is_corrob_fh = any("stubble" in t or "beard" in t for t in corroborated_tokens)
            fh_weight = "1.55" if is_corrob_fh else "1.5"
            if any("stubble" in t for t in raw_tokens_found):
                prompt_parts.append(f"(heavy stubble beard:{fh_weight}), coarse 5 o'clock shadow dark stubble across lower jaw, chin, and upper lip")
            elif any("full_beard" in t for t in raw_tokens_found):
                prompt_parts.append(f"(full dense beard:{fh_weight}), dark full beard covering lower face")
        if is_clean_shaven:
            prompt_parts.append("(clean-shaven face:1.5), (no beard, no moustache, no stubble:1.5)")

        # Priority 8: REMAINING ANATOMICAL (cheekbones, jaw, chin, ears, neck, marks)
        prompt_parts.extend(feature_descriptors_by_priority[5])

        # Priority 9: DEMOGRAPHICS (age + gender + ethnicity)
        prompt_parts.append(demographics_phrase)

        # Priority 10: AGE SKIN MARKERS
        prompt_parts.append(age_info["lines"])

        # Priority 11: DETAIL LEVEL
        prompt_parts.append(detail_prompt)

        # Priority 12: LIGHTING
        prompt_parts.append(lighting_prompt)

        # Priority 13: EXPLICIT EXCLUSION ANCHORS (positive-side prohibitions)
        exclusion_anchors = "single person only, no multiple people, no two faces, no side by side, no split view, no text overlay, no watermark, no signature, no background objects, no background elements, no dramatic lighting, head and neck and upper shoulder area only"
        if not is_color_style:
            exclusion_anchors += ", no color, monochrome only"
        prompt_parts.append(exclusion_anchors)

        if not is_black_bg and not is_color_style:
            prompt_parts.append("law enforcement forensic evidence drawing, neutral white backdrop, anatomically precise")

        # Inject logical separator hints to help CLIP segment attention blocks
        # (STYLE BLOCK . VIEW BLOCK . ANATOMY BLOCK . ACCESSORIES BLOCK .)
        positive_prompt = ". ".join(part for part in prompt_parts if part)

        # ══════════════════════════════════════════════════════════════════════
        # 8. ASSEMBLE NEGATIVE PROMPT — Hardened per style
        # ══════════════════════════════════════════════════════════════════════
        negative_parts: List[str] = [
            # Anti-dual / Anti-duplicate / Anti-comparison suppression (highest weight — universal)
            "(two faces:2.0), (multiple faces:2.0), (two people:2.0), (dual image:2.0), (side by side:2.0), (diptych:2.0), (triptych:2.0), (split image:2.0), (split screen:2.0), (twin:2.0), (twins:2.0), (duplicate:2.0), (cloned face:2.0), (multiple views:2.0), (before and after:2.0), (comparison:2.0), (double portrait:2.0), (extra head:2.0), (two heads:2.0), (second person:2.0), (multiple people:2.0), (group:2.0), (collage:2.0), (photo collage:2.0)",
            # Seam / robot / frame suppression (highest weight — universal)
            "(frame:1.5), (picture frame:1.5), (border:1.5), (gold frame:1.5), (ornate frame:1.5), (decorative border:1.5), (cameo:1.5)",
            "(seam:1.8), (split face:1.8), (vertical line down face:1.8), (vertical line down forehead:1.8), (vertical cleft:1.8), (facial seam:1.8), (grid line:1.8), (robot:1.8), (mannequin:1.8), (wooden dummy:1.8), (cyborg:1.8), (split screen:1.8), (wireframe:1.8), (halved face:1.8), (divided face:1.8)",
        ]

        if is_black_bg:
            negative_parts.append(
                "(white background:2.0), (light background:2.0), (grey background:1.8), "
                "(light gray background:1.8), (cream background:1.8), (paper background:1.6), "
                "(off-white background:1.6), (colored background:1.5)"
            )
            negative_parts.append(
                "(color:1.8), (colour:1.8), (photograph:1.8), (photorealistic:1.8), "
                "(3d render:1.5), (digital art:1.5), (oil painting:1.4)"
            )
        elif not is_color_style:
            negative_parts.append("(color:1.5), (photograph:1.5), (photorealistic:1.5), (3d render:1.3), (oil painting:1.3)")
        else:
            negative_parts.append("(monochrome:1.5), (black and white:1.5), (grayscale:1.5), (pencil sketch:1.3), (line drawing:1.3), (desaturated:1.4), (pale gray zombie skin:1.5)")

        if is_clean_shaven:
            negative_parts.append("(beard:1.6), (mustache:1.6), (moustache:1.6), (stubble:1.6), (facial hair:1.6), (goatee:1.6), (5 o clock shadow:1.5)")

        if has_glasses:
            negative_parts.append("(no glasses:1.4), (bare eyes without spectacles:1.4), (face without eyeglasses:1.4)")

        if has_headwear:
            negative_parts.append("(bald head without hat:1.4), (bare scalp without cap:1.4)")

        negative_parts.extend([
            style_info["negative"],
            angle_info["negative"],
            eth_info["negative"],
            "deformed, bad anatomy, missing features, extra eyes, mutated, blurry, bad proportions, asymmetric face",
            "smile, grinning, open mouth, exaggerated expressions, beauty filter, airbrushed, glamour",
            "(watermark:1.5), (signature:1.5), (text:1.5), (letters:1.5), (numbers:1.5), multiple people",
            "racial caricature, exaggerated ethnic features, muddy black skin, unnatural dark patches",
            "dramatic shadows, rim lighting, studio spotlight, colored gels",
        ])

        negative_prompt = ", ".join(part for part in negative_parts if part)

        # ── 9. Confidence Score ───────────────────────────────────────────────
        feature_count = len(set(raw_tokens_found))
        base_confidence = 91.5
        bonus = min(5.0, feature_count * 0.7)
        corroboration_bonus = min(3.5, len(corroborated_tokens) * 1.2)
        confidence_score = round(min(99.5, base_confidence + bonus + corroboration_bonus), 1)

        # ── 10. Dossier ───────────────────────────────────────────────────────
        morphological_traits = [
            f"Cranial structure calibrated for {effective_gender or 'adult'} {effective_age}",
            f"Demographic baseline: {eth_info['label']}",
            f"Camera perspective aligned to {angle_info['description']}",
            f"Identified {feature_count} distinct forensic feature conditioning tokens",
            f"Artistic medium: {effective_style}",
            f"Synthesis fidelity: {detail_level} ({steps} diffusion steps, CFG={cfg})",
        ]
        if corroborated_tokens:
            morphological_traits.append(
                f"Corroborated {len(corroborated_tokens)} traits across witness statement & UI: "
                + ", ".join(t.replace("_", " ") for t in corroborated_tokens)
            )
        if has_glasses:
            morphological_traits.append(f"Eyewear accessory: {detected_glasses_label.replace('_', ' ')}")
        if is_black_bg:
            morphological_traits.append("Rendering: Monochrome white linework on black background (chalkboard forensic style)")

        reasoning = (
            f"Forensic LLM v3 evaluated {feature_count} facial feature tokens for a {effective_gender or 'adult'} subject "
            f"in the {effective_age} age cohort calibrated with {eth_info['label']}. "
            f"Applied {camera_angle} geometric orientation. "
            f"Tailored prompt conditioning for '{effective_style}' (CFG={cfg}, steps={steps})."
            + (f" Corroborated {len(corroborated_tokens)} cross-source traits ({', '.join(corroborated_tokens)})." if corroborated_tokens else "")
            + (f" Integrated eyewear: {detected_glasses_label.replace('_', ' ')}." if has_glasses else "")
            + (" Black-background monochrome chalkboard rendering activated." if is_black_bg else "")
        )

        llm_analysis = {
            "feature_summary": resolved_features,
            "morphological_traits": morphological_traits,
            "demographic_heritage": eth_info["label"],
            "age_markers": age_info["markers"],
            "perspective_parameters": {
                "angle": camera_angle,
                "yaw_degrees": angle_info["yaw"],
                "description": angle_info["description"],
            },
            "style_execution": {
                "style": effective_style,
                "cfg_scale": cfg,
                "control_weight": style_info["control_weight"],
                "steps": steps,
            },
            "confidence_score": confidence_score,
            "reasoning": reasoning,
            "feature_count": feature_count,
            "corroborated_traits": [t.replace("_", " ") for t in corroborated_tokens],
            "is_black_background": is_black_bg,
            "is_color_style": is_color_style,
        }

        resolved_control_weight = style_info["control_weight"]
        if is_black_bg:
            resolved_control_weight = min(resolved_control_weight, 0.35)

        return {
            "positive_prompt": positive_prompt,
            "negative_prompt": negative_prompt,
            "steps": steps,
            "cfg_scale": cfg,
            "control_weight": resolved_control_weight,
            "llm_analysis": llm_analysis,
            "effective_attributes": effective_attributes,
        }


forensic_llm_engine = ForensicLLMEngine()
