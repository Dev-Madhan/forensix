/**
 * High-Aesthetic Forensic Cranial Morph Engine
 * 
 * Generates an ultra-clean, minimal, professional cranial silhouette wireframe
 * based on symmetrical cubic Bézier segments on a 320x400 coordinate space (cx = 160).
 * Features an anatomically flawless craniofacial dome, natural lateral ears, and elegant cervical neck lines.
 * Supports buttery-smooth GSAP morphing between Face Shapes, Jawlines, and Chins.
 */

export interface CranialAnchorPoints {
  crownY: number;

  // Parietal Vault (Upper skull dome)
  parietalX: number;
  parietalY: number;

  // Temple
  templeX: number;
  templeY: number;

  // Zygomatic Cheekbone
  cheekX: number;
  cheekY: number;

  // Mandibular Gonial Jaw Angle
  gonialX: number;
  gonialY: number;

  // Lateral Chin / Mentum base
  chinBaseX: number;
  chinBaseY: number;

  // Chin Apex (Center bottom)
  chinApexY: number;

  // Lateral Ear Anchors
  earRootX: number;
  earRootY: number;
  earWidth: number;
  earHeight: number;

  // Cervical Neck & Trapezius
  neckOriginX: number;
  neckOriginY: number;
  neckShoulderX: number;
  neckShoulderY: number;
}

/** Baseline Harmonious Oval Archetype (Golden Ratio Anatomy) */
export const OVAL_ARCHETYPE: CranialAnchorPoints = {
  crownY: 44,
  parietalX: 234,
  parietalY: 114,
  templeX: 231,
  templeY: 154,
  cheekX: 228,
  cheekY: 186,
  gonialX: 215,
  gonialY: 240,
  chinBaseX: 176,
  chinBaseY: 279,
  chinApexY: 282,

  earRootX: 231,
  earRootY: 144,
  earWidth: 14,
  earHeight: 58,

  neckOriginX: 215,
  neckOriginY: 241,
  neckShoulderX: 262,
  neckShoulderY: 368,
};

/** Face Shape Profiles */
export const FACE_SHAPE_PROFILES: Record<string, Partial<CranialAnchorPoints>> = {
  // Oval: Harmonious classic proportions
  fs_oval: { ...OVAL_ARCHETYPE },

  // Round: Softer, wider, continuous circular jaw curve
  fs_round: {
    crownY: 48,
    parietalX: 238,
    parietalY: 116,
    templeX: 236,
    templeY: 156,
    cheekX: 235,
    cheekY: 188,
    gonialX: 222,
    gonialY: 236,
    chinBaseX: 182,
    chinBaseY: 274,
    chinApexY: 277,
    earRootX: 236,
    earRootY: 146,
    earWidth: 14,
    earHeight: 56,
  },

  // Square: Confident defined jawline, parallel temples, wide chin
  fs_square: {
    crownY: 42,
    parietalX: 238,
    parietalY: 110,
    templeX: 237,
    templeY: 150,
    cheekX: 236,
    cheekY: 186,
    gonialX: 228,
    gonialY: 244,
    chinBaseX: 186,
    chinBaseY: 282,
    chinApexY: 284,
    earRootX: 237,
    earRootY: 142,
    earWidth: 14,
    earHeight: 58,
  },

  // Oblong: Refined elongated vertical skull, slender sides
  fs_oblong: {
    crownY: 36,
    parietalX: 229,
    parietalY: 110,
    templeX: 226,
    templeY: 152,
    cheekX: 224,
    cheekY: 186,
    gonialX: 210,
    gonialY: 246,
    chinBaseX: 172,
    chinBaseY: 288,
    chinApexY: 294,
    earRootX: 226,
    earRootY: 142,
    earWidth: 13,
    earHeight: 60,
  },

  // Diamond: Prominent high cheekbone flare, tapered forehead and chin
  fs_diamond: {
    crownY: 44,
    parietalX: 228,
    parietalY: 114,
    templeX: 227,
    templeY: 150,
    cheekX: 238,
    cheekY: 180,
    gonialX: 208,
    gonialY: 238,
    chinBaseX: 172,
    chinBaseY: 282,
    chinApexY: 288,
    earRootX: 233,
    earRootY: 144,
    earWidth: 14,
    earHeight: 58,
  },

  // Heart: Broad upper forehead tapering gracefully to an acute chin
  fs_heart: {
    crownY: 42,
    parietalX: 238,
    parietalY: 110,
    templeX: 236,
    templeY: 150,
    cheekX: 228,
    cheekY: 182,
    gonialX: 206,
    gonialY: 238,
    chinBaseX: 171,
    chinBaseY: 280,
    chinApexY: 285,
    earRootX: 234,
    earRootY: 142,
    earWidth: 14,
    earHeight: 58,
  },
};

/** Jawline Archetypes */
export const JAWLINE_PROFILES: Record<string, Partial<CranialAnchorPoints>> = {
  jaw_soft: {
    gonialX: 213,
    gonialY: 238,
    chinBaseX: 176,
  },
  jaw_rounded: {
    gonialX: 217,
    gonialY: 238,
    chinBaseX: 178,
  },
  jaw_angular: {
    gonialX: 223,
    gonialY: 244,
    chinBaseX: 177,
  },
  jaw_wide: {
    gonialX: 227,
    gonialY: 242,
    chinBaseX: 181,
  },
  jaw_narrow: {
    gonialX: 207,
    gonialY: 236,
    chinBaseX: 173,
  },
  jaw_square: {
    gonialX: 227,
    gonialY: 246,
    chinBaseX: 184,
  },
};

/** Chin Archetypes */
export const CHIN_PROFILES: Record<string, Partial<CranialAnchorPoints>> = {
  chin_rounded: {
    chinBaseX: 178,
    chinApexY: 282,
  },
  chin_pointed: {
    chinBaseX: 170,
    chinApexY: 290,
  },
  chin_broad: {
    chinBaseX: 186,
    chinApexY: 282,
  },
  chin_narrow: {
    chinBaseX: 172,
    chinApexY: 284,
  },
  chin_square: {
    chinBaseX: 185,
    chinApexY: 284,
  },
  chin_receding: {
    chinBaseX: 176,
    chinApexY: 275,
  },
};

/** Ear Archetypes */
export const EAR_PROFILES: Record<string, Partial<CranialAnchorPoints>> = {
  ear_regular: {
    earWidth: 14,
    earHeight: 58,
    earRootY: 144,
  },
  ear_attached: {
    earWidth: 13,
    earHeight: 53,
    earRootY: 144,
  },
  ear_free: {
    earWidth: 15.5,
    earHeight: 64,
    earRootY: 143,
  },
  ear_protruding: {
    earWidth: 19,
    earHeight: 58,
    earRootY: 143,
  },
  ear_pointed: {
    earWidth: 15,
    earHeight: 60,
    earRootY: 141,
  },
  ear_narrow: {
    earWidth: 10.5,
    earHeight: 55,
    earRootY: 145,
  },
};

/**
 * Sanitizes and fills any missing cranial parameters with OVAL_ARCHETYPE fallbacks.
 * Guarantees zero undefined property errors across hot reload, state transitions, or partial overrides.
 */
export function sanitizeCranialParams(
  raw?: Partial<CranialAnchorPoints> | null
): CranialAnchorPoints {
  const p = raw || {};
  return {
    crownY: p.crownY ?? OVAL_ARCHETYPE.crownY,
    parietalX: p.parietalX ?? OVAL_ARCHETYPE.parietalX,
    parietalY: p.parietalY ?? OVAL_ARCHETYPE.parietalY,
    templeX: p.templeX ?? OVAL_ARCHETYPE.templeX,
    templeY: p.templeY ?? OVAL_ARCHETYPE.templeY,
    cheekX: p.cheekX ?? (p.templeX != null ? p.templeX - 3 : OVAL_ARCHETYPE.cheekX),
    cheekY: p.cheekY ?? OVAL_ARCHETYPE.cheekY,
    gonialX: p.gonialX ?? OVAL_ARCHETYPE.gonialX,
    gonialY: p.gonialY ?? OVAL_ARCHETYPE.gonialY,
    chinBaseX: p.chinBaseX ?? OVAL_ARCHETYPE.chinBaseX,
    chinBaseY: p.chinBaseY ?? OVAL_ARCHETYPE.chinBaseY,
    chinApexY: p.chinApexY ?? OVAL_ARCHETYPE.chinApexY,
    earRootX: p.earRootX ?? (p.templeX ?? OVAL_ARCHETYPE.earRootX),
    earRootY: p.earRootY ?? OVAL_ARCHETYPE.earRootY,
    earWidth: p.earWidth ?? OVAL_ARCHETYPE.earWidth,
    earHeight: p.earHeight ?? OVAL_ARCHETYPE.earHeight,
    neckOriginX: p.neckOriginX ?? OVAL_ARCHETYPE.neckOriginX,
    neckOriginY: p.neckOriginY ?? OVAL_ARCHETYPE.neckOriginY,
    neckShoulderX: p.neckShoulderX ?? OVAL_ARCHETYPE.neckShoulderX,
    neckShoulderY: p.neckShoulderY ?? OVAL_ARCHETYPE.neckShoulderY,
  };
}

/** Neck Archetypes Configuration */
export interface NeckProfileConfig {
  originXOffset: number; // Offset outward from gonialX (>= 0 prevents crossing the mandibular border)
  originYOffset: number; // Vertical offset from gonialY
  shoulderX: number;     // Lateral shoulder span
  shoulderY: number;     // Vertical shoulder/trapezius height
}

export const NECK_PROFILES: Record<string, NeckProfileConfig> = {
  neck_standard: {
    originXOffset: 0,
    originYOffset: 1,
    shoulderX: 262,
    shoulderY: 368,
  },
  neck_thick: {
    originXOffset: 3.5,
    originYOffset: -4,
    shoulderX: 274,
    shoulderY: 356,
  },
  neck_slender: {
    originXOffset: 0,
    originYOffset: 2,
    shoulderX: 250,
    shoulderY: 374,
  },
  neck_wide: {
    originXOffset: 5,
    originYOffset: -2,
    shoulderX: 280,
    shoulderY: 362,
  },
  neck_long: {
    originXOffset: 0,
    originYOffset: 3,
    shoulderX: 254,
    shoulderY: 382,
  },
  neck_short: {
    originXOffset: 3,
    originYOffset: -6,
    shoulderX: 270,
    shoulderY: 350,
  },
};

/**
 * Merge base + face shape + jawline + chin + ears + neck into target anchor parameters
 */
export function computeTargetCranialParams(
  faceShapeId?: string,
  jawlineId?: string,
  chinId?: string,
  earId?: string,
  neckId?: string
): CranialAnchorPoints {
  const result: CranialAnchorPoints = { ...OVAL_ARCHETYPE };

  if (faceShapeId && FACE_SHAPE_PROFILES[faceShapeId]) {
    Object.assign(result, FACE_SHAPE_PROFILES[faceShapeId]);
  }

  if (jawlineId && JAWLINE_PROFILES[jawlineId]) {
    Object.assign(result, JAWLINE_PROFILES[jawlineId]);
  }

  if (chinId && CHIN_PROFILES[chinId]) {
    Object.assign(result, CHIN_PROFILES[chinId]);
  }

  if (earId && EAR_PROFILES[earId]) {
    Object.assign(result, EAR_PROFILES[earId]);
  }

  // Base cervical neck alignment dynamically locked to mandibular gonial angle
  result.neckOriginX = result.gonialX;
  result.neckOriginY = result.gonialY + 1;

  if (neckId && NECK_PROFILES[neckId]) {
    const np = NECK_PROFILES[neckId];
    result.neckOriginX = result.gonialX + np.originXOffset;
    result.neckOriginY = result.gonialY + np.originYOffset;
    result.neckShoulderX = np.shoulderX;
    result.neckShoulderY = np.shoulderY;
  }

  return sanitizeCranialParams(result);
}

/**
 * Generates the clean, continuous, aesthetic craniofacial outline SVG path.
 * Traced symmetrically from Crown (top) -> Right cheek & jaw -> Chin -> Left cheek & jaw -> Crown.
 * Completely free of lumps, bumps, or jagged vertices.
 */
export function generateCranialPath(rawParams: CranialAnchorPoints): string {
  const p = sanitizeCranialParams(rawParams);
  const cx = 160;

  // Key Right landmarks
  const topX = cx;
  const topY = p.crownY;

  const prX = p.parietalX;
  const prY = p.parietalY;

  const tmX = p.templeX;
  const tmY = p.templeY;

  const ckX = p.cheekX;
  const ckY = p.cheekY;

  const gnX = p.gonialX;
  const gnY = p.gonialY;

  const cbX = p.chinBaseX;
  const cbY = p.chinBaseY;

  const chY = p.chinApexY;

  // Key Left landmarks (Exact mathematical mirror across cx = 160)
  const lprX = cx - (prX - cx);
  const ltmX = cx - (tmX - cx);
  const lckX = cx - (ckX - cx);
  const lgnX = cx - (gnX - cx);
  const lcbX = cx - (cbX - cx);

  const crWidth = prX - cx;

  const d = [
    // 1. Crown top vertex
    `M ${topX.toFixed(2)} ${topY.toFixed(2)}`,

    // Crown to Right Parietal Vault (smooth, parabolic cranial dome)
    `C ${(topX + crWidth * 0.52).toFixed(2)} ${topY.toFixed(2)}, ${prX.toFixed(2)} ${(topY + (prY - topY) * 0.46).toFixed(2)}, ${prX.toFixed(2)} ${prY.toFixed(2)}`,

    // Parietal Vault to Temple
    `C ${prX.toFixed(2)} ${(prY + 18).toFixed(2)}, ${tmX.toFixed(2)} ${(tmY - 14).toFixed(2)}, ${tmX.toFixed(2)} ${tmY.toFixed(2)}`,

    // Temple to Zygomatic Cheekbone
    `C ${tmX.toFixed(2)} ${(tmY + 12).toFixed(2)}, ${ckX.toFixed(2)} ${(ckY - 12).toFixed(2)}, ${ckX.toFixed(2)} ${ckY.toFixed(2)}`,

    // Cheekbone down to Mandibular Gonial Jaw Angle
    `C ${ckX.toFixed(2)} ${(ckY + 22).toFixed(2)}, ${gnX.toFixed(2)} ${(gnY - 18).toFixed(2)}, ${gnX.toFixed(2)} ${gnY.toFixed(2)}`,

    // Gonial Jaw Angle to Chin Base
    `C ${(gnX - 6).toFixed(2)} ${(gnY + 16).toFixed(2)}, ${(cbX + 12).toFixed(2)} ${(cbY - 4).toFixed(2)}, ${cbX.toFixed(2)} ${cbY.toFixed(2)}`,

    // Chin Base to Chin Apex (Center bottom)
    `C ${(cbX - 8).toFixed(2)} ${chY.toFixed(2)}, ${(cx + 6).toFixed(2)} ${chY.toFixed(2)}, ${topX.toFixed(2)} ${chY.toFixed(2)}`,

    // Chin Apex to Left Chin Base
    `C ${(cx - 6).toFixed(2)} ${chY.toFixed(2)}, ${(lcbX + 8).toFixed(2)} ${chY.toFixed(2)}, ${lcbX.toFixed(2)} ${cbY.toFixed(2)}`,

    // Left Chin Base up to Left Gonial Jaw Angle
    `C ${(lcbX - 12).toFixed(2)} ${(cbY - 4).toFixed(2)}, ${(lgnX + 6).toFixed(2)} ${(gnY + 16).toFixed(2)}, ${lgnX.toFixed(2)} ${gnY.toFixed(2)}`,

    // Left Gonial Jaw Angle up to Left Cheekbone
    `C ${lgnX.toFixed(2)} ${(gnY - 18).toFixed(2)}, ${lckX.toFixed(2)} ${(ckY + 22).toFixed(2)}, ${lckX.toFixed(2)} ${ckY.toFixed(2)}`,

    // Left Cheekbone up to Left Temple
    `C ${lckX.toFixed(2)} ${(ckY - 12).toFixed(2)}, ${ltmX.toFixed(2)} ${(tmY + 12).toFixed(2)}, ${ltmX.toFixed(2)} ${tmY.toFixed(2)}`,

    // Left Temple up to Left Parietal Vault
    `C ${ltmX.toFixed(2)} ${(tmY - 14).toFixed(2)}, ${lprX.toFixed(2)} ${(prY + 18).toFixed(2)}, ${lprX.toFixed(2)} ${prY.toFixed(2)}`,

    // Left Parietal Vault back to Crown top
    `C ${lprX.toFixed(2)} ${(topY + (prY - topY) * 0.46).toFixed(2)}, ${(topX - crWidth * 0.52).toFixed(2)} ${topY.toFixed(2)}, ${topX.toFixed(2)} ${topY.toFixed(2)}`,

    "Z",
  ];

  return d.join(" ");
}

/**
 * Generates Right Ear paths (outer helix/lobe and delicate inner concha/antihelix fold)
 */
export function generateRightEarPath(rawParams: CranialAnchorPoints): { outer: string; inner: string } {
  const p = sanitizeCranialParams(rawParams);
  const rootX = p.earRootX;
  const rootY = p.earRootY;
  const w = p.earWidth;
  const h = p.earHeight;

  const helixX = rootX + w;
  const helixY = rootY + h * 0.38;
  const lobeX = rootX + w * 0.45;
  const lobeY = rootY + h * 0.92;
  const tuckX = rootX - 5;
  const tuckY = rootY + h;

  const outer =
    `M ${rootX.toFixed(2)} ${rootY.toFixed(2)} ` +
    `C ${(rootX + w * 0.85).toFixed(2)} ${(rootY + 2).toFixed(2)}, ${helixX.toFixed(2)} ${(helixY - 10).toFixed(2)}, ${helixX.toFixed(2)} ${helixY.toFixed(2)} ` +
    `C ${helixX.toFixed(2)} ${(helixY + 16).toFixed(2)}, ${(lobeX + 2).toFixed(2)} ${(lobeY - 6).toFixed(2)}, ${lobeX.toFixed(2)} ${lobeY.toFixed(2)} ` +
    `C ${(lobeX - 4).toFixed(2)} ${(lobeY + 4).toFixed(2)}, ${(tuckX + 4).toFixed(2)} ${(tuckY + 1).toFixed(2)}, ${tuckX.toFixed(2)} ${tuckY.toFixed(2)}`;

  const innerTopX = rootX + w * 0.42;
  const innerTopY = rootY + h * 0.22;
  const innerMidX = rootX + w * 0.55;
  const innerMidY = rootY + h * 0.46;
  const innerBotX = rootX + w * 0.22;
  const innerBotY = rootY + h * 0.72;

  const inner =
    `M ${innerTopX.toFixed(2)} ${innerTopY.toFixed(2)} ` +
    `C ${innerMidX.toFixed(2)} ${(innerTopY + 8).toFixed(2)}, ${innerMidX.toFixed(2)} ${(innerBotY - 8).toFixed(2)}, ${innerBotX.toFixed(2)} ${innerBotY.toFixed(2)}`;

  return { outer, inner };
}

/**
 * Generates Left Ear paths (exact symmetrical reflection)
 */
export function generateLeftEarPath(rawParams: CranialAnchorPoints): { outer: string; inner: string } {
  const p = sanitizeCranialParams(rawParams);
  const cx = 160;
  const rootX = cx - (p.earRootX - cx);
  const rootY = p.earRootY;
  const w = p.earWidth;
  const h = p.earHeight;

  const helixX = rootX - w;
  const helixY = rootY + h * 0.38;
  const lobeX = rootX - w * 0.45;
  const lobeY = rootY + h * 0.92;
  const tuckX = rootX + 5;
  const tuckY = rootY + h;

  const outer =
    `M ${rootX.toFixed(2)} ${rootY.toFixed(2)} ` +
    `C ${(rootX - w * 0.85).toFixed(2)} ${(rootY + 2).toFixed(2)}, ${helixX.toFixed(2)} ${(helixY - 10).toFixed(2)}, ${helixX.toFixed(2)} ${helixY.toFixed(2)} ` +
    `C ${helixX.toFixed(2)} ${(helixY + 16).toFixed(2)}, ${(lobeX - 2).toFixed(2)} ${(lobeY - 6).toFixed(2)}, ${lobeX.toFixed(2)} ${lobeY.toFixed(2)} ` +
    `C ${(lobeX + 4).toFixed(2)} ${(lobeY + 4).toFixed(2)}, ${(tuckX - 4).toFixed(2)} ${(tuckY + 1).toFixed(2)}, ${tuckX.toFixed(2)} ${tuckY.toFixed(2)}`;

  const innerTopX = rootX - w * 0.42;
  const innerTopY = rootY + h * 0.22;
  const innerMidX = rootX - w * 0.55;
  const innerMidY = rootY + h * 0.46;
  const innerBotX = rootX - w * 0.22;
  const innerBotY = rootY + h * 0.72;

  const inner =
    `M ${innerTopX.toFixed(2)} ${innerTopY.toFixed(2)} ` +
    `C ${innerMidX.toFixed(2)} ${(innerTopY + 8).toFixed(2)}, ${innerMidX.toFixed(2)} ${(innerBotY - 8).toFixed(2)}, ${innerBotX.toFixed(2)} ${innerBotY.toFixed(2)}`;

  return { outer, inner };
}

/**
 * Left Sternocleidomastoid & Cervical Neck Line
 * Curves strictly outward from mandibular angle to shoulder, eliminating any face contour intersection.
 */
export function generateLeftNeckPath(rawParams: CranialAnchorPoints): string {
  const p = sanitizeCranialParams(rawParams);
  const cx = 160;
  const startX = cx - (p.neckOriginX - cx);
  const startY = p.neckOriginY;
  const endX = cx - (p.neckShoulderX - cx);
  const endY = p.neckShoulderY;

  return (
    `M ${startX.toFixed(2)} ${startY.toFixed(2)} ` +
    `C ${(startX - 1.5).toFixed(2)} ${(startY + 22).toFixed(2)}, ${(startX - 7.5).toFixed(2)} 298, ${(startX - 15).toFixed(2)} 318 ` +
    `C ${(startX - 23).toFixed(2)} 338, ${(endX + 16).toFixed(2)} ${(endY - 6).toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`
  );
}

/**
 * Right Sternocleidomastoid & Cervical Neck Line
 * Curves strictly outward from mandibular angle to shoulder, eliminating any face contour intersection.
 */
export function generateRightNeckPath(rawParams: CranialAnchorPoints): string {
  const p = sanitizeCranialParams(rawParams);
  const startX = p.neckOriginX;
  const startY = p.neckOriginY;
  const endX = p.neckShoulderX;
  const endY = p.neckShoulderY;

  return (
    `M ${startX.toFixed(2)} ${startY.toFixed(2)} ` +
    `C ${(startX + 1.5).toFixed(2)} ${(startY + 22).toFixed(2)}, ${(startX + 7.5).toFixed(2)} 298, ${(startX + 15).toFixed(2)} 318 ` +
    `C ${(startX + 23).toFixed(2)} 338, ${(endX - 16).toFixed(2)} ${(endY - 6).toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`
  );
}

/**
 * Faint Clavicle / Collarbone Accents
 */
export function generateClaviclePaths(): { left: string; right: string } {
  const cx = 160;
  return {
    left: `M ${(cx - 48).toFixed(2)} 364 C ${(cx - 32).toFixed(2)} 361, ${(cx - 18).toFixed(2)} 365, ${(cx - 10).toFixed(2)} 368`,
    right: `M ${(cx + 48).toFixed(2)} 364 C ${(cx + 32).toFixed(2)} 361, ${(cx + 18).toFixed(2)} 365, ${(cx + 10).toFixed(2)} 368`,
  };
}
