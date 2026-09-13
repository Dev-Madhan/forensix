/**
 * Forensic Composite Sketch Prompt Engineering Engine v2
 *
 * Each dataset token maps to precise Stable Diffusion visual descriptors
 * that SD 1.5 + ControlNet Lineart can faithfully render.
 * Every token from facial-dataset-data.ts is covered below.
 */

export interface ForensicPromptInput {
  witnessStatement?: string;
  attributes: Record<string, string>;
  sketchStyle?: string;
  cameraAngle?: "frontal" | "three_quarter" | "profile";
  ageGroup?: string;
  gender?: string;
  ethnicity?: string;
  lightingMood?: "neutral_studio" | "crime_scene";
  detailLevel?: "Draft" | "Standard" | "Master";
}

export interface EngineeredForensicPrompt {
  prompt: string;
  negativePrompt: string;
  styleDescription: string;
  angleDescription: string;
  demographicsDescription: string;
  featureTokens: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER TOKEN → SD DESCRIPTOR LOOKUP TABLE
// Maps every facial-dataset-data.ts token to specific SD-comprehensible phrases
// ─────────────────────────────────────────────────────────────────────────────
const TOKEN_DESCRIPTORS: Record<string, string> = {
  // Face Shape
  oval_face_shape: "oval-shaped face, balanced cranial proportions, gently tapering jawline",
  round_face_shape: "round face shape, full cheeks, soft rounded jawline, equal width and height",
  square_face_shape: "square face shape, strong broad jawline, wide prominent forehead, angular facial structure",
  oblong_face_shape: "oblong elongated face, long vertical cranial profile, narrow uniform width throughout",
  diamond_face_shape: "diamond face shape, high wide angular cheekbones, narrow forehead and chin",
  heart_face_shape: "heart-shaped face, wide prominent forehead, dramatically narrow pointed chin",

  // Jawline
  soft_jawline: "soft gentle jawline, smooth subtle bone definition, rounded lower face",
  rounded_jawline: "rounded jawline, smooth continuous curve from earlobe to chin",
  angular_jawline: "sharp angular jawline, prominent mandible definition, acute chiseled gonial angle",
  wide_jawline: "wide broad jawline, expansive lateral jaw span, authoritative lower face structure",
  narrow_jawline: "narrow jawline, compressed lateral mandible, steep inward jaw angle",
  square_jawline: "square strong jawline, flat horizontal mandibular base with defined perpendicular corners",

  // Chin
  rounded_chin: "rounded soft chin, gentle convex mental curve",
  pointed_chin: "pointed chin, pronounced triangular mental protuberance, sharp chin apex",
  broad_chin: "broad wide chin, horizontal mental base with bilateral tubercles",
  narrow_chin: "narrow chin, tightly pinched petite mental apex",
  square_chin: "square chin, flat broad horizontal mental base with defined corners",
  receding_chin: "receding chin, weak chin posterior to facial angle, retruded mental position",
  cleft_chin_dimple: "prominent cleft chin, central chin dimple, split mental protuberance",

  // Ears
  regular_ears: "normal proportioned ears, classic helix curve, standard detached earlobe",
  attached_earlobe: "attached earlobes, lobule slopes directly into jaw without gap",
  free_earlobe: "free hanging earlobes, distinct rounded hanging lobule, clear separation from neck",
  protruding_ears: "protruding ears, prominent lateral ear projection, ears flaring outward from skull",
  pointed_ears: "slightly pointed ears, angular peak at superior helix margin",
  narrow_ears: "slender narrow ears, compact elongated auricle close to temporal bone",

  // Neck
  standard_neck: "standard proportioned neck, balanced cervical diameter, natural trapezius slope",
  thick_neck: "thick muscular neck, substantial wide cervical column, broad elevated trapezius",
  slender_neck: "slender thin neck, graceful narrow cervical circumference, elongated neck",
  wide_neck: "wide heavy neck, broad lateral cervical span, heavy neck connecting to wide shoulders",
  long_neck: "long neck, high extended cervical column, pronounced throat line",
  short_neck: "short compact neck, compressed cervical height, steep high-angled trapezius",

  // Cheeks
  high_prominent_cheekbones: "high prominent cheekbones, sculpted angular zygomatic arches, defined cheekbones",
  gaunt_hollow_cheeks: "gaunt hollow cheeks, sunken sub-malar hollows, lean angular midface",
  full_buccal_cheeks: "full plump cheeks, rounded buccal fat pads, chubby smooth lower midface",
  cheek_dimples: "bilateral cheek dimples, muscular zygomatic depressions beside mouth",

  // Age Lines
  forehead_furrows: "deep forehead furrows, transverse frontal creases, horizontal forehead wrinkles",
  glabellar_frown_lines: "glabellar frown lines, vertical corrugator furrows between eyebrows, 11 lines",
  crows_feet_wrinkles: "crow's feet wrinkles, radiating lateral orbital creases from outer eye corners",
  nasolabial_folds: "prominent nasolabial folds, deep parenthesis grooves from nose to mouth corners",
  marionette_lines: "marionette lines, vertical mandibular creases descending from mouth corners to jaw",

  // Eye Shape
  almond_eyes: "almond-shaped eyes, classic tapered outer canthus, balanced symmetrical eyelids",
  round_eyes: "round wide eyes, large open palpebral fissure, visible sclera around iris",
  narrow_eyes: "narrow slanted eyes, slender horizontal palpebral aperture, compressed eyelids",
  large_eyes: "large prominent eyes, wide expansive ocular opening, prominent radiant iris",
  small_eyes: "small compact eyes, narrow palpebral length relative to face",
  deep_set_eyes: "deep-set eyes, eyes recessed into the skull, prominent supraorbital brow ridge casting shadow",

  // Eye Size
  small_eye_size: "small narrow eyes, compact palpebral length",
  medium_eye_size: "medium standard eyes, proportional balanced eye aperture",
  large_eye_size: "large wide eyes, prominent wide ocular aperture",

  // Eye Position
  close_set_eyes: "close-set eyes, intercanthal distance narrower than one eye width, eyes near nose bridge",
  normal_set_eyes: "normal-set eyes, balanced intercanthal distance, standard eye spacing",
  wide_set_eyes: "wide-set eyes, broad intercanthal distance, eyes far apart on face",
  upturned_eyes: "slightly upturned eyes, outer lateral canthus elevated, positive canthal tilt",
  downturned_eyes: "slightly downturned eyes, outer canthus depressed lower than inner, droopy outer eye corners",

  // Eyebrows
  straight_eyebrows: "straight horizontal eyebrows, flat eyebrow arch, no curve",
  arched_eyebrows: "arched curved eyebrows, prominent arch peak over iris, classic brow shape",
  thick_eyebrows: "thick dense eyebrows, heavy full brow hair, prominent bushy eyebrows",
  thin_eyebrows: "thin fine eyebrows, sparse narrow brow line",
  high_set_eyebrows: "high-set eyebrows, eyebrows positioned high on forehead, wide brow-to-eye gap",
  low_set_eyebrows: "low-set heavy eyebrows, eyebrows positioned close to eyes, heavy brow ridge",

  // Nose
  straight_nose: "straight nose, smooth dorsal line, balanced nasal bridge without deviations",
  aquiline_roman_nose: "aquiline roman nose, convex curved nasal bridge, strong hooked nose profile",
  upturned_nose: "upturned nose, elevated nasal tip, visible nostrils from frontal view",
  broad_nose: "broad wide nose, wide nasal base and bridge, prominent wide nostrils",
  narrow_nose: "narrow nose, slim nasal bridge, compressed nostrils",
  bulbous_fleshy_nose: "bulbous fleshy nose, rounded enlarged nasal tip, prominent soft nose tip",
  hawk_beaked_nose: "hawk beaked nose, sharp downward-hooked nasal tip, prominent hooked nasal profile",
  broken_deviated_nose: "broken deviated nose, nasal dorsum deviation, asymmetrical nose with bump",
  pointed_nose: "pointed sharp nose, narrow elongated nasal tip",
  rounded_nose: "rounded nose tip, soft rounded nasal apex",
  pierced_nostril_stud_nose: "nostril stud piercing, small stud in nostril",

  // Mouth
  full_lips: "full prominent lips, voluminous upper and lower lip, well-defined Cupid's bow",
  thin_lips: "thin lips, narrow compressed vermilion, minimal lip volume",
  medium_lips: "medium standard lips, balanced proportional lip width and height",
  wide_mouth: "wide mouth, broad commissure span, wide oral opening",
  narrow_mouth: "narrow small mouth, compressed commissure width",
  downturned_mouth: "downturned mouth corners, oral commissures depressed, sad expression shape",
  parted_lips_visible_teeth: "slightly parted lips showing upper front teeth",

  // Teeth
  crooked_irregular_teeth: "crooked misaligned teeth, irregular dental arrangement",
  diastema_gap_teeth: "diastema gap between front teeth, prominent gap between central incisors",
  gold_tooth_crown: "gold tooth crown, gold dental cap visible",

  // Eyewear
  thin_wire_rim_glasses: "thin wire-rimmed glasses, delicate metal frame spectacles",
  thick_black_horn_rim_glasses: "thick black horn-rimmed glasses, bold heavy dark frame eyeglasses",
  rectangular_frames_glasses: "rectangular framed glasses, angular rectangular lens frames",
  aviator_wire_glasses: "aviator wire frame glasses, teardrop-shaped metal frame sunglasses",
  dark_tinted_sunglasses: "dark tinted sunglasses, opaque dark lens sunglasses",
  browline_clubmaster_glasses: "browline clubmaster glasses, bold upper frame thicker than lower",

  // Beard
  stubble_beard: "short stubble beard, several days of facial hair growth, unshaved stubble",
  full_beard: "full dense beard, heavy complete facial hair coverage",
  goatee_beard: "goatee beard, chin beard with clean shaven cheeks",
  chinstrap_beard: "chin strap beard, narrow beard line following jaw, clean cheeks",
  vandyke_beard: "Van Dyke beard, pointed goatee with disconnected moustache",

  // Moustache
  classic_moustache: "classic moustache, full moustache above upper lip",
  pencil_thin_moustache: "pencil thin moustache, very narrow fine moustache line",
  handlebar_horseshoe_moustache: "handlebar moustache, long curled ends extending down",
  thick_chevron_walrus_moustache: "thick walrus moustache, heavy chevron moustache drooping over lip",
  pyramidal_toothbrush_moustache: "small square toothbrush moustache centered under nose",

  // Hair
  short_cropped_hair: "short cropped hair, close-cut hair, neat short style",
  buzz_crew_cut_hair: "buzz cut crew cut hair, very short uniform hair length",
  medium_layered_hair: "medium length layered hair, shoulder-length styled hair",
  long_flowing_hair: "long flowing hair, below-shoulder length hair",
  wavy_curly_hair: "wavy curly hair, textured spiral curls",
  afro_textured_hair: "afro textured natural hair, voluminous kinky coiled hair",
  slicked_back_hair: "slicked-back hair, hair combed back from forehead",
  side_part_hair: "side part hair, hair parted and combed to one side",
  fade_undercut_hair: "fade undercut hair, short sides fading to longer top",
  bald_receded_hair: "bald head, receded hairline, bare scalp",

  // Hairline
  high_hairline: "high receding hairline, large exposed forehead area",
  low_hairline: "low hairline, hair starts low on forehead",

  // Facial Details / Marks
  facial_scar: "prominent facial scar, visible scar mark on face",
  cheek_slash_laceration_scar: "cheek laceration scar, slash scar on cheek",
  eyebrow_vertical_scar: "vertical scar through eyebrow",
  facial_mole: "facial mole, dark melanocytic nevus on face",
  dense_facial_freckles: "dense facial freckles, scattered melanin spots across nose and cheeks",
  facial_tattoo: "facial tattoo marking",
  teardrop_eye_tattoo: "teardrop tattoo below eye, prison teardrop tattoo",
  temple_cross_tattoo: "cross tattoo on temple",

  // Headwear
  baseball_cap_forward: "baseball cap worn forward, curved brim cap",
  baseball_cap_backwards: "baseball cap worn backwards, reversed cap",
  knit_beanie_cap: "knit beanie hat, woolen beanie pulled down over head",
  hoodie_pulled_up_hood: "hood pulled up over head, hoodie with drawn hood",
  flat_cap_newsboy: "flat cap, newsboy cap, tweed flat cap",
};

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY ADJUSTMENTS — returned alongside the prompt so the Python service
// can use them to position the ControlNet lineart anchors more accurately
// ─────────────────────────────────────────────────────────────────────────────
export interface GeometryHints {
  eyeSpacing: "close" | "normal" | "wide";
  eyeVertical: "normal" | "upturned" | "downturned";
  noseLength: "short" | "medium" | "long";
  chinDrop: "normal" | "low" | "high";
  faceWidthBias: "narrow" | "normal" | "wide";
  jawWidth: "narrow" | "normal" | "wide" | "square";
}

function deriveGeometryHints(attributes: Record<string, string>): GeometryHints {
  const hints: GeometryHints = {
    eyeSpacing: "normal",
    eyeVertical: "normal",
    noseLength: "medium",
    chinDrop: "normal",
    faceWidthBias: "normal",
    jawWidth: "normal",
  };

  const eyePos = attributes["eye_position"] || "";
  if (eyePos === "close_set_eyes") hints.eyeSpacing = "close";
  else if (eyePos === "wide_set_eyes") hints.eyeSpacing = "wide";
  if (eyePos === "upturned_eyes") hints.eyeVertical = "upturned";
  else if (eyePos === "downturned_eyes") hints.eyeVertical = "downturned";

  const nose = attributes["nose_types"] || "";
  if (nose.includes("upturned")) hints.noseLength = "short";
  else if (nose.includes("aquiline") || nose.includes("hawk")) hints.noseLength = "long";

  const chin = attributes["chin"] || "";
  if (chin.includes("receding") || chin.includes("narrow")) hints.chinDrop = "high";
  else if (chin.includes("broad") || chin.includes("square")) hints.chinDrop = "low";

  const face = attributes["face_shape"] || "";
  if (face.includes("oblong") || face.includes("heart")) hints.faceWidthBias = "narrow";
  else if (face.includes("round") || face.includes("square")) hints.faceWidthBias = "wide";

  const jaw = attributes["jawline"] || "";
  if (jaw.includes("narrow")) hints.jawWidth = "narrow";
  else if (jaw.includes("wide")) hints.jawWidth = "wide";
  else if (jaw.includes("square")) hints.jawWidth = "square";

  return hints;
}

export function buildForensicPrompt(input: ForensicPromptInput): EngineeredForensicPrompt & { geometryHints: GeometryHints } {
  const {
    witnessStatement,
    attributes,
    sketchStyle = "Forensic Graphite (Pencil)",
    cameraAngle = "frontal",
    ageGroup = "26-35",
    gender = "Male",
    ethnicity = "Unspecified",
    lightingMood = "neutral_studio",
    detailLevel = "Standard",
  } = input;

  // 1. Camera Angle
  let anglePrompt = "direct frontal mugshot view, perfectly symmetrical front-facing portrait, en-face composite";
  let angleDesc = "Frontal (0° En Face)";
  if (cameraAngle === "three_quarter") {
    anglePrompt = "three-quarter angle portrait, 45-degree head turn, jawline depth visible, cheekbone contour";
    angleDesc = "Three-Quarter (45° Profile)";
  } else if (cameraAngle === "profile") {
    anglePrompt = "strict side lateral 90-degree profile, accurate nasal bridge projection and chin silhouette";
    angleDesc = "Side Profile (90° Lateral)";
  }

  // 2. Sketch Style
  let styleModifiers = "";
  let styleDesc = sketchStyle;
  switch (sketchStyle) {
    case "Realistic Charcoal":
      styleModifiers = "forensic charcoal portrait, textured charcoal paper, smudged graphite shading, high-contrast chiaroscuro, deep charcoal tones, police composite drawing";
      break;
    case "Digital Identi-Kit (Lineart)":
      styleModifiers = "clean digital police identikit drawing, high-contrast black ink contours, anatomically precise lineart, no shading, law enforcement reference composite";
      break;
    case "Color Age-Progressed":
      styleModifiers = "forensic age-progressed colored portrait, colored pencil tinting, natural skin tones, realistic aging signs, police identification art";
      break;
    case "Forensic Graphite (Pencil)":
    default:
      styleModifiers = "authentic forensic pencil sketch, FBI artist composite, sharp 2B graphite linework, fine cross-hatching, paper grain texture, monochrome police suspect drawing";
      styleDesc = "Forensic Graphite (Pencil)";
      break;
  }

  // 3. Demographics
  const demoTokens: string[] = [];
  if (gender && gender !== "Unspecified") demoTokens.push(`${gender.toLowerCase()} suspect`);
  else demoTokens.push("criminal suspect");
  if (ageGroup) demoTokens.push(`approximately ${ageGroup} years old`);
  if (ethnicity && ethnicity !== "Unspecified") demoTokens.push(`${ethnicity.toLowerCase()} descent`);
  const demographicsDescription = demoTokens.join(", ");

  // 4. TOKEN RESOLUTION — map every selected dataset token to its SD descriptor
  const featureTokens: string[] = [];
  const resolvedDescriptors: string[] = [];

  // If _feature_tokens is passed (the concatenated token list from context), resolve each
  const rawTokenList = attributes["_feature_tokens"];
  if (rawTokenList) {
    rawTokenList.split(", ").forEach((tok) => {
      const descriptor = TOKEN_DESCRIPTORS[tok.trim()];
      if (descriptor) {
        resolvedDescriptors.push(descriptor);
        featureTokens.push(tok.trim());
      }
    });
  }

  // Also scan all attribute values directly (subcategory keys hold tokens)
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith("_")) continue; // skip meta fields
    if (key.endsWith("_name")) continue; // skip human name duplicates
    const descriptor = TOKEN_DESCRIPTORS[value];
    if (descriptor && !resolvedDescriptors.includes(descriptor)) {
      resolvedDescriptors.push(descriptor);
      if (!featureTokens.includes(value)) featureTokens.push(value);
    }
  }

  // 5. Lighting
  const lightingPrompt = lightingMood === "crime_scene"
    ? "dramatic crime-scene directional light, hard cheekbone shadows, atmospheric ambient shadow"
    : "neutral forensic studio lighting, flat even illumination, clear anatomical visibility";

  // 6. Detail Level
  let detailPrompt = "high-fidelity forensic anatomical proportions, clear facial landmarks";
  if (detailLevel === "Master") {
    detailPrompt = "ultra-detailed forensic masterpiece, micro graphite cross-hatching, realistic pore texture, intricate iris striations, hyper-accurate anatomy";
  } else if (detailLevel === "Draft") {
    detailPrompt = "rapid forensic impression, confident bold graphite strokes, strong structural contours";
  }

  // 7. Assemble final prompt — feature descriptors go FIRST for highest conditioning weight
  const promptSegments: string[] = [
    styleModifiers,
    demographicsDescription,
    anglePrompt,
    ...resolvedDescriptors,          // <-- most important: specific SD visual descriptors
    lightingPrompt,
    detailPrompt,
    "official police composite sketch, law enforcement evidence document, neutral white background, centered composition",
  ];

  if (witnessStatement && witnessStatement.trim().length > 0) {
    promptSegments.push(`witness account: "${witnessStatement.trim()}"`); 
  }

  const finalPrompt = promptSegments.filter(Boolean).join(", ");

  // 8. Negative prompt — stay strict forensic
  const negativePrompt = [
    "color photograph, photorealistic, digital photo",
    "cartoon, anime, manga, 3D CGI, video game character",
    "blurry, watermark, signature, text, logo",
    "extra eyes, missing features, deformed anatomy, bad proportions",
    "smile, laughing, exaggerated expression",
    "beauty filter, airbrushed, glossy, oversaturated",
    "multiple faces, cropped face, partial face",
  ].join(", ");

  const geometryHints = deriveGeometryHints(attributes);

  return {
    prompt: finalPrompt,
    negativePrompt,
    styleDescription: styleDesc,
    angleDescription: angleDesc,
    demographicsDescription,
    featureTokens,
    geometryHints,
  };
}
