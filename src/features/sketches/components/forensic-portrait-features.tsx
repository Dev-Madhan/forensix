"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { FeatureItem } from "./sketch-context";
import { CranialAnchorPoints } from "./forensic-cranial-morph-engine";

interface PortraitProps {
  selectedFeatures: Record<string, FeatureItem>;
  cranialParams: CranialAnchorPoints;
}

/**
 * Custom GSAP Feature Entrance & Morph Hook
 * Ensures every appearing facial feature glides in with silky, organic graphite elegance.
 * Unconditionally safe for React 19 (never called after an early return).
 */
function useFeatureGSAPReveal(
  triggerKey: string | undefined,
  origin: string = "center center",
  yDelta: number = 2.5
) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!ref.current || !triggerKey) return;

    // Organic graphite pencil sketch reveal animation
    const tween = gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        scale: 0.94,
        y: yDelta,
        transformOrigin: origin,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.52,
        ease: "power2.out",
      }
    );

    return () => {
      tween.kill();
    };
  }, [triggerKey, origin, yDelta]);

  return ref;
}

/**
 * Forensic Eyes Layer
 * Only renders when an eye feature is actively selected by the user.
 * Features refined, natural aesthetic forensic pencil linework.
 */
export function ForensicEyesLayer({
  selectedFeatures,
}: {
  selectedFeatures: Record<string, FeatureItem>;
}) {
  const eyeFeature = selectedFeatures["eye_shape"];
  const eyeSize = selectedFeatures["eye_size"]?.id || "eye_sz_medium";
  const eyePosition = selectedFeatures["eye_position"]?.id || "eye_pos_normal";

  const isVisible = Boolean(eyeFeature || selectedFeatures["eye_size"] || selectedFeatures["eye_position"]);
  const eyeShape = eyeFeature?.id || "eye_almond";
  const triggerKey = isVisible ? `${eyeShape}_${eyeSize}_${eyePosition}` : undefined;

  // Unconditional hook call at top level for React 19 compliance
  const revealRef = useFeatureGSAPReveal(triggerKey, "160px 146px", 2);

  if (!isVisible) {
    return null;
  }

  // Intercanthal spacing (distance from midline X=160 to each eye center)
  let intercanthal = 46;
  if (eyePosition === "eye_pos_close") intercanthal = 40;
  else if (eyePosition === "eye_pos_wide") intercanthal = 52;

  // Scale modifier
  let scale = 1.0;
  if (eyeSize === "eye_sz_small") scale = 0.88;
  else if (eyeSize === "eye_sz_large") scale = 1.12;

  // Canthal tilt angle
  let tiltDeg = 0;
  if (eyePosition === "eye_pos_upturned") tiltDeg = 3.0;
  else if (eyePosition === "eye_pos_downturned") tiltDeg = -3.0;

  const leftEyeX = 160 - intercanthal;
  const rightEyeX = 160 + intercanthal;
  const eyeY = 146;

  const renderSingleEye = (isRight: boolean) => {
    let palpebralUpper = "M -20 0 C -11 -10 11 -10 20 0";
    let palpebralLower = "M -20 0 C -11 9 11 9 20 0";
    let creaseUpper = "M -17 -8 C -9 -14 9 -14 17 -8";
    let irisRadius = 6.8;
    let pupilRadius = 2.8;

    switch (eyeShape) {
      case "eye_round":
        palpebralUpper = "M -19 0 C -10 -13 10 -13 19 0";
        palpebralLower = "M -19 0 C -10 12 10 12 19 0";
        creaseUpper = "M -16 -10 C -8 -17 8 -17 16 -10";
        irisRadius = 7.5;
        pupilRadius = 3.2;
        break;
      case "eye_narrow":
        palpebralUpper = "M -21 0 C -11 -7 11 -7 21 0";
        palpebralLower = "M -21 0 C -11 6 11 6 21 0";
        creaseUpper = "M -18 -6 C -9 -10 9 -10 18 -6";
        irisRadius = 6.2;
        pupilRadius = 2.5;
        break;
      case "eye_large":
        palpebralUpper = "M -21 0 C -11 -12 11 -12 21 0";
        palpebralLower = "M -21 0 C -11 11 11 11 21 0";
        creaseUpper = "M -19 -10 C -9 -16 9 -16 19 -10";
        irisRadius = 7.8;
        pupilRadius = 3.4;
        break;
      case "eye_small":
        palpebralUpper = "M -18 0 C -9 -7 9 -7 18 0";
        palpebralLower = "M -18 0 C -9 7 9 7 18 0";
        creaseUpper = "M -15 -6 C -7 -11 7 -11 15 -6";
        irisRadius = 5.8;
        pupilRadius = 2.4;
        break;
      case "eye_deep_set":
        palpebralUpper = "M -20 0 C -11 -9 11 -9 20 0";
        palpebralLower = "M -20 0 C -11 8 11 8 20 0";
        creaseUpper = "M -19 -11 C -9 -17 9 -17 19 -11";
        irisRadius = 6.6;
        pupilRadius = 2.8;
        break;
      case "eye_cat_eye":
        palpebralUpper = "M -20 2 C -10 -9 11 -13 22 -3";
        palpebralLower = "M -20 2 C -10 9 10 9 22 -3";
        creaseUpper = "M -17 -7 C -9 -14 10 -15 20 -7";
        irisRadius = 6.8;
        pupilRadius = 2.8;
        break;
      case "eye_doe":
        palpebralUpper = "M -20 0 C -10 -15 10 -15 20 0";
        palpebralLower = "M -20 0 C -10 13 10 13 20 0";
        creaseUpper = "M -18 -11 C -9 -18 9 -18 18 -11";
        irisRadius = 8.2;
        pupilRadius = 3.6;
        break;
      case "eye_hooded":
        palpebralUpper = "M -21 0 C -11 -9 11 -9 21 0";
        palpebralLower = "M -21 0 C -11 8 11 8 21 0";
        creaseUpper = "M -20 -4 C -10 -7 10 -7 20 -4";
        irisRadius = 6.5;
        pupilRadius = 2.7;
        break;
      case "eye_monolid":
        palpebralUpper = "M -20 0 C -11 -8 11 -8 20 0";
        palpebralLower = "M -20 0 C -11 7 11 7 20 0";
        creaseUpper = "M -16 -4 C -8 -7 8 -7 16 -4";
        irisRadius = 6.4;
        pupilRadius = 2.6;
        break;
      case "eye_almond":
      default:
        palpebralUpper = "M -20 0 C -11 -10 11 -10 20 0";
        palpebralLower = "M -20 0 C -11 9 11 9 20 0";
        creaseUpper = "M -17 -8 C -9 -14 9 -14 17 -8";
        irisRadius = 6.8;
        pupilRadius = 2.8;
        break;
    }

    const clipId = `eye-clip-${isRight ? "r" : "l"}`;

    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <path d={`${palpebralUpper} ${palpebralLower.replace("M", "L")} Z`} />
          </clipPath>
        </defs>

        {/* Delicate eyelid crease fold */}
        <path
          d={creaseUpper}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.0"
          strokeLinecap="round"
          className="opacity-60"
        />

        {/* Eyeball contour */}
        <path
          d={`${palpebralUpper} ${palpebralLower.replace("M", "L")} Z`}
          fill="#0c0e14"
          stroke="#E2E8F0"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Iris and Pupil */}
        <g clipPath={`url(#${clipId})`}>
          <circle cx="0" cy="0" r={irisRadius} fill="#1E293B" stroke="#94A3B8" strokeWidth="0.7" />
          <circle cx="0" cy="0" r={pupilRadius} fill="#05070B" />
          <circle cx="-2.0" cy="-2.0" r="1.1" fill="#FFFFFF" className="opacity-80" />
        </g>

        {/* Upper Lash Line (clean defined pencil stroke) */}
        <path
          d={palpebralUpper}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <g ref={revealRef} id="forensic-layer-eyes" className="forensic-sketch-feature">
      {/* Left Eye */}
      <g transform={`translate(${leftEyeX}, ${eyeY}) scale(${scale}) rotate(${-tiltDeg})`}>
        {renderSingleEye(false)}
      </g>

      {/* Right Eye (mirrored) */}
      <g transform={`translate(${rightEyeX}, ${eyeY}) scale(${-scale}, ${scale}) rotate(${tiltDeg})`}>
        {renderSingleEye(true)}
      </g>
    </g>
  );
}

/**
 * Forensic Cheeks & Zygomatic Prominence Layer
 * Renders high cheekbones, gaunt sub-malar hollows, full buccal pads, or dimples.
 */
export function ForensicCheeksLayer({
  selectedFeatures,
  cranialParams,
}: {
  selectedFeatures: Record<string, FeatureItem>;
  cranialParams: CranialAnchorPoints;
}) {
  const cheekItem = selectedFeatures["cheeks"];
  const cheekId = cheekItem?.id;
  const isVisible = Boolean(cheekId);
  const revealRef = useFeatureGSAPReveal(isVisible ? cheekId : undefined, "160px 170px", 2);

  if (!isVisible) return null;

  const cx = 160;
  const ckX = cranialParams.cheekX;
  const ckY = cranialParams.cheekY;
  const lckX = cx - (ckX - cx);

  return (
    <g id="forensic-cheeks-layer" ref={revealRef}>
      {cheekId === "cheeks_high_prominent" && (
        <g id="forensic-cheeks-prominent">
          <path
            d={`M ${(lckX + 12).toFixed(2)} ${(ckY - 2).toFixed(2)} C ${(lckX + 26).toFixed(2)} ${(ckY - 10).toFixed(2)}, ${(cx - 24).toFixed(2)} ${(ckY - 2).toFixed(2)}, ${(cx - 16).toFixed(2)} ${(ckY + 8).toFixed(2)}`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.3"
            strokeLinecap="round"
            className="opacity-80"
          />
          <path
            d={`M ${(ckX - 12).toFixed(2)} ${(ckY - 2).toFixed(2)} C ${(ckX - 26).toFixed(2)} ${(ckY - 10).toFixed(2)}, ${(cx + 24).toFixed(2)} ${(ckY - 2).toFixed(2)}, ${(cx + 16).toFixed(2)} ${(ckY + 8).toFixed(2)}`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.3"
            strokeLinecap="round"
            className="opacity-80"
          />
          {/* Zygomatic highlights & light hatching */}
          <line x1={lckX + 18} y1={ckY + 2} x2={lckX + 24} y2={ckY + 8} stroke="#94A3B8" strokeWidth="0.9" className="opacity-50" />
          <line x1={lckX + 24} y1={ckY + 2} x2={lckX + 30} y2={ckY + 8} stroke="#94A3B8" strokeWidth="0.9" className="opacity-50" />
          <line x1={ckX - 18} y1={ckY + 2} x2={ckX - 24} y2={ckY + 8} stroke="#94A3B8" strokeWidth="0.9" className="opacity-50" />
          <line x1={ckX - 24} y1={ckY + 2} x2={ckX - 30} y2={ckY + 8} stroke="#94A3B8" strokeWidth="0.9" className="opacity-50" />
        </g>
      )}

      {cheekId === "cheeks_gaunt_hollow" && (
        <g id="forensic-cheeks-gaunt">
          {/* Sub-malar hollow shadow curves */}
          <path
            d={`M ${(lckX + 16).toFixed(2)} ${(ckY + 8).toFixed(2)} C ${(lckX + 12).toFixed(2)} ${(ckY + 28).toFixed(2)}, ${(lckX + 22).toFixed(2)} ${(ckY + 44).toFixed(2)}, ${(cx - 28).toFixed(2)} 230`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="opacity-70"
          />
          <path
            d={`M ${(ckX - 16).toFixed(2)} ${(ckY + 8).toFixed(2)} C ${(ckX - 12).toFixed(2)} ${(ckY + 28).toFixed(2)}, ${(ckX - 22).toFixed(2)} ${(ckY + 44).toFixed(2)}, ${(cx + 28).toFixed(2)} 230`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="opacity-70"
          />
          {/* Gaunt cross-hatching */}
          <line x1={lckX + 14} y1={ckY + 22} x2={lckX + 24} y2={ckY + 24} stroke="#64748B" strokeWidth="1.0" className="opacity-60" />
          <line x1={lckX + 16} y1={ckY + 30} x2={lckX + 26} y2={ckY + 32} stroke="#64748B" strokeWidth="1.0" className="opacity-60" />
          <line x1={ckX - 14} y1={ckY + 22} x2={ckX - 24} y2={ckY + 24} stroke="#64748B" strokeWidth="1.0" className="opacity-60" />
          <line x1={ckX - 16} y1={ckY + 30} x2={ckX - 26} y2={ckY + 32} stroke="#64748B" strokeWidth="1.0" className="opacity-60" />
        </g>
      )}

      {cheekId === "cheeks_full_buccal" && (
        <g id="forensic-cheeks-full">
          <path
            d={`M ${(lckX + 6).toFixed(2)} ${(ckY + 12).toFixed(2)} C ${(lckX + 8).toFixed(2)} ${(ckY + 36).toFixed(2)}, ${(lckX + 24).toFixed(2)} ${(ckY + 54).toFixed(2)}, ${(cx - 26).toFixed(2)} 234`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.3"
            strokeLinecap="round"
            className="opacity-60"
          />
          <path
            d={`M ${(ckX - 6).toFixed(2)} ${(ckY + 12).toFixed(2)} C ${(ckX - 8).toFixed(2)} ${(ckY + 36).toFixed(2)}, ${(ckX - 24).toFixed(2)} ${(ckY + 54).toFixed(2)}, ${(cx + 26).toFixed(2)} 234`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.3"
            strokeLinecap="round"
            className="opacity-60"
          />
        </g>
      )}

      {cheekId === "cheeks_dimples" && (
        <g id="forensic-cheeks-dimples">
          <path
            d={`M ${cx - 36} 234 C ${cx - 38} 240, ${cx - 38} 246, ${cx - 35} 252`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="opacity-85"
          />
          <circle cx={cx - 36.5} cy={243} r="1.4" fill="#0F172A" stroke="#94A3B8" strokeWidth="0.8" />
          <path
            d={`M ${cx + 36} 234 C ${cx + 38} 240, ${cx + 38} 246, ${cx + 35} 252`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="opacity-85"
          />
          <circle cx={cx + 36.5} cy={243} r="1.4" fill="#0F172A" stroke="#94A3B8" strokeWidth="0.8" />
        </g>
      )}

      {cheekId === "cheeks_apple" && (
        <g id="forensic-cheeks-apple">
          {/* Soft rounded apple of the cheek highlights & contour */}
          <path
            d={`M ${(lckX + 16).toFixed(2)} ${(ckY + 4).toFixed(2)} C ${(lckX + 12).toFixed(2)} ${(ckY + 18).toFixed(2)}, ${(cx - 24).toFixed(2)} ${(ckY + 28).toFixed(2)}, ${(cx - 16).toFixed(2)} ${(ckY + 16).toFixed(2)}`}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="opacity-70"
          />
          <path
            d={`M ${(ckX - 16).toFixed(2)} ${(ckY + 4).toFixed(2)} C ${(ckX - 12).toFixed(2)} ${(ckY + 18).toFixed(2)}, ${(cx + 24).toFixed(2)} ${(ckY + 28).toFixed(2)}, ${(cx + 16).toFixed(2)} ${(ckY + 16).toFixed(2)}`}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="opacity-70"
          />
        </g>
      )}

      {cheekId === "cheeks_sculpted_zygomatic" && (
        <g id="forensic-cheeks-sculpted">
          <path
            d={`M ${(lckX + 10).toFixed(2)} ${(ckY - 4).toFixed(2)} C ${(lckX + 28).toFixed(2)} ${(ckY - 6).toFixed(2)}, ${(cx - 22).toFixed(2)} ${(ckY + 8).toFixed(2)}, ${(cx - 18).toFixed(2)} ${(ckY + 18).toFixed(2)}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="opacity-80"
          />
          <path
            d={`M ${(ckX - 10).toFixed(2)} ${(ckY - 4).toFixed(2)} C ${(ckX - 28).toFixed(2)} ${(ckY - 6).toFixed(2)}, ${(cx + 22).toFixed(2)} ${(ckY + 8).toFixed(2)}, ${(cx + 18).toFixed(2)} ${(ckY + 18).toFixed(2)}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="opacity-80"
          />
        </g>
      )}
    </g>
  );
}

/**
 * Forensic Age Lines & Facial Furrows Layer
 * Renders forehead furrows, glabellar lines, crow's feet, nasolabial folds, and marionette lines.
 */
export function ForensicAgeLinesLayer({
  selectedFeatures,
}: {
  selectedFeatures: Record<string, FeatureItem>;
}) {
  const ageItem = selectedFeatures["age_lines"];
  const ageId = ageItem?.id;
  const isVisible = Boolean(ageId);
  const revealRef = useFeatureGSAPReveal(isVisible ? ageId : undefined, "160px 150px", 2);

  if (!isVisible) return null;

  const cx = 160;

  return (
    <g id="forensic-age-lines-layer" ref={revealRef}>
      {ageId === "age_forehead_furrows" && (
        <g id="forensic-forehead-furrows">
          <path
            d={`M ${cx - 42} 98 C ${cx - 20} 94, ${cx + 20} 94, ${cx + 42} 98`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.3"
            strokeLinecap="round"
            className="opacity-75"
          />
          <path
            d={`M ${cx - 48} 108 C ${cx - 24} 104, ${cx + 24} 104, ${cx + 48} 108`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="opacity-85"
          />
          <path
            d={`M ${cx - 36} 118 C ${cx - 18} 115, ${cx + 18} 115, ${cx + 36} 118`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="opacity-70"
          />
        </g>
      )}

      {ageId === "age_glabellar_lines" && (
        <g id="forensic-glabellar-lines">
          {/* Vertical corrugator furrows (11 lines) */}
          <path
            d={`M ${cx - 4.5} 128 C ${cx - 5.5} 136, ${cx - 5} 144, ${cx - 3.5} 148`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="opacity-90"
          />
          <path
            d={`M ${cx + 4.5} 128 C ${cx + 5.5} 136, ${cx + 5} 144, ${cx + 3.5} 148`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="opacity-90"
          />
          {/* Subtle transverse root notch */}
          <path
            d={`M ${cx - 6} 145 C ${cx} 147, ${cx + 6} 145`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.0"
            className="opacity-50"
          />
        </g>
      )}

      {ageId === "age_crows_feet" && (
        <g id="forensic-crows-feet">
          {/* Left lateral canthal radiating lines */}
          <line x1={cx - 62} y1={143} x2={cx - 74} y2={138} stroke="#CBD5E1" strokeWidth="1.3" strokeLinecap="round" className="opacity-85" />
          <line x1={cx - 64} y1={147} x2={cx - 78} y2={147} stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" className="opacity-90" />
          <line x1={cx - 62} y1={151} x2={cx - 74} y2={156} stroke="#CBD5E1" strokeWidth="1.3" strokeLinecap="round" className="opacity-85" />

          {/* Right lateral canthal radiating lines */}
          <line x1={cx + 62} y1={143} x2={cx + 74} y2={138} stroke="#CBD5E1" strokeWidth="1.3" strokeLinecap="round" className="opacity-85" />
          <line x1={cx + 64} y1={147} x2={cx + 78} y2={147} stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" className="opacity-90" />
          <line x1={cx + 62} y1={151} x2={cx + 74} y2={156} stroke="#CBD5E1" strokeWidth="1.3" strokeLinecap="round" className="opacity-85" />
        </g>
      )}

      {ageId === "age_nasolabial_folds" && (
        <g id="forensic-nasolabial-folds">
          {/* Left deep groove from nasal ala to mouth corner */}
          <path
            d={`M ${cx - 18} 206 C ${cx - 24} 218, ${cx - 26} 232, ${cx - 22} 248`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="opacity-90"
          />
          <path
            d={`M ${cx - 16} 210 C ${cx - 21} 220, ${cx - 23} 232, ${cx - 20} 244`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.0"
            className="opacity-50"
          />

          {/* Right deep groove from nasal ala to mouth corner */}
          <path
            d={`M ${cx + 18} 206 C ${cx + 24} 218, ${cx + 26} 232, ${cx + 22} 248`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="opacity-90"
          />
          <path
            d={`M ${cx + 16} 210 C ${cx + 21} 220, ${cx + 23} 232, ${cx + 20} 244`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.0"
            className="opacity-50"
          />
        </g>
      )}

      {ageId === "age_marionette_lines" && (
        <g id="forensic-marionette-lines">
          {/* Descending creases from mouth corners towards jaw */}
          <path
            d={`M ${cx - 24} 250 C ${cx - 26} 260, ${cx - 25} 272, ${cx - 21} 282`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="opacity-85"
          />
          <path
            d={`M ${cx + 24} 250 C ${cx + 26} 260, ${cx + 25} 272, ${cx + 21} 282`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="opacity-85"
          />
          {/* Mental crease above chin */}
          <path
            d={`M ${cx - 14} 268 C ${cx} 271, ${cx + 14} 268`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="opacity-60"
          />
        </g>
      )}
    </g>
  );
}

/**
 * Forensic Eyebrows Layer
 * Only renders when an eyebrow feature is actively selected by the user.
 */
export function ForensicEyebrowsLayer({
  selectedFeatures,
}: {
  selectedFeatures: Record<string, FeatureItem>;
}) {
  const browFeature = selectedFeatures["eyebrows"];
  const eyePosition = selectedFeatures["eye_position"]?.id || "eye_pos_normal";

  const isVisible = Boolean(browFeature);
  const browShape = browFeature?.id || "brow_straight";
  const triggerKey = isVisible ? `${browShape}_${eyePosition}` : undefined;

  // Unconditional hook call at top level for React 19 compliance
  const revealRef = useFeatureGSAPReveal(triggerKey, "160px 127px", 2);

  if (!isVisible) return null;

  let intercanthal = 46;
  if (eyePosition === "eye_pos_close") intercanthal = 40;
  else if (eyePosition === "eye_pos_wide") intercanthal = 52;

  let browY = 127;
  let strokeWidth = 1.6;

  if (browShape === "brow_high_set" || browShape === "brow_high_glam") browY = 121;
  else if (browShape === "brow_low_set") browY = 132;
  else if (browShape === "brow_thick") strokeWidth = 2.2;
  else if (browShape === "brow_thin" || browShape === "brow_feathered") strokeWidth = 1.25;

  const leftBrowX = 160 - intercanthal;
  const rightBrowX = 160 + intercanthal;

  const getBrowPath = () => {
    switch (browShape) {
      case "brow_arched":
        return "M -22 3 C -11 -4 8 -8 22 5";
      case "brow_thick":
        return "M -22 2 C -10 -4 10 -4 23 2";
      case "brow_thin":
        return "M -20 2 C -10 -2 10 -2 21 2";
      case "brow_high_set":
        return "M -22 3 C -11 -5 9 -5 22 4";
      case "brow_low_set":
        return "M -22 2 C -11 -2 9 -2 22 2";
      case "brow_feathered":
        return "M -22 3 C -10 -4 9 -5 21 3";
      case "brow_high_glam":
        return "M -22 4 C -10 -8 8 -9 22 5";
      case "brow_soft_straight":
        return "M -22 1 C -10 0 10 0 22 1";
      case "brow_s_shaped":
        return "M -22 4 C -13 0 5 -7 22 4";
      case "brow_straight":
      default:
        return "M -22 2 C -10 -2 10 -2 22 2";
    }
  };

  const path = getBrowPath();

  return (
    <g ref={revealRef} id="forensic-layer-eyebrows" className="forensic-sketch-feature">
      {/* Left Eyebrow */}
      <g transform={`translate(${leftBrowX}, ${browY})`}>
        <path d={path} fill="none" stroke="#FFFFFF" strokeWidth={strokeWidth} strokeLinecap="round" />
      </g>

      {/* Right Eyebrow */}
      <g transform={`translate(${rightBrowX}, ${browY}) scale(-1, 1)`}>
        <path d={path} fill="none" stroke="#FFFFFF" strokeWidth={strokeWidth} strokeLinecap="round" />
      </g>
    </g>
  );
}

/**
 * Forensic Nose Layer
 * Only renders when a nose feature is actively selected by the user.
 */
export function ForensicNoseLayer({
  selectedFeatures,
}: {
  selectedFeatures: Record<string, FeatureItem>;
}) {
  const noseFeature = selectedFeatures["nose_types"];
  const isVisible = Boolean(noseFeature);
  const noseShape = noseFeature?.id || "nose_straight";
  const triggerKey = isVisible ? `${noseShape}` : undefined;

  // Unconditional hook call at top level for React 19 compliance
  const revealRef = useFeatureGSAPReveal(triggerKey, "160px 200px", 2.5);

  if (!isVisible) return null;

  const cx = 160;

  const renderNoseArtwork = () => {
    switch (noseShape) {
      case "nose_broad":
        return (
          <g id="forensic-nose-broad">
            {/* Wide Glabella Root */}
            <path
              d={`M ${cx - 8.5} 148 C ${cx - 6} 154, ${cx - 6.5} 160, ${cx - 7} 166`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeDasharray="1.5 2"
              className="opacity-60"
            />
            <path
              d={`M ${cx + 8.5} 148 C ${cx + 6} 154, ${cx + 6.5} 160, ${cx + 7} 166`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.3"
              className="opacity-70"
            />

            {/* Broad Dorsal Bridge (wide 14px dorsal plateau with soft graphite plane) */}
            <polygon
              points={`${cx - 7},166 ${cx + 7},166 ${cx + 8},202 ${cx - 8},202`}
              fill="#CBD5E1"
              opacity="0.08"
            />
            <line x1={cx - 7} y1={166} x2={cx - 7.5} y2={202} stroke="#94A3B8" strokeWidth="1.1" strokeDasharray="1.5 2" className="opacity-50" />
            <line x1={cx + 7} y1={166} x2={cx + 7.5} y2={202} stroke="#FFFFFF" strokeWidth="1.4" className="opacity-90" />
            <line x1={cx} y1={168} x2={cx} y2={201} stroke="#FFFFFF" strokeWidth="0.7" className="opacity-35" />

            {/* Broad Tip Lobule (wide 18px span with flattened apex) */}
            <path
              d={`M ${cx - 9} 205 C ${cx - 4} 203, ${cx + 4} 203, ${cx + 9} 205`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.2"
              className="opacity-70"
            />
            <path
              d={`M ${cx - 9.5} 212 C ${cx - 5} 216, ${cx + 5} 216, ${cx + 9.5} 212`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Flared Lateral Alar Wings (spans 42px from cx-21 to cx+21) */}
            <path
              d={`M ${cx - 17} 208 C ${cx - 21} 212, ${cx - 20} 218, ${cx - 13} 220`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx - 18} 209 C ${cx - 22} 213, ${cx - 21} 217, ${cx - 15} 219`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              className="opacity-60"
            />
            <path
              d={`M ${cx + 17} 208 C ${cx + 21} 212, ${cx + 20} 218, ${cx + 13} 220`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 18} 209 C ${cx + 22} 213, ${cx + 21} 217, ${cx + 15} 219`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              className="opacity-60"
            />

            {/* Wide Horizontal Nostril Apertures */}
            <path
              d={`M ${cx - 14} 218 C ${cx - 12} 215, ${cx - 6} 215, ${cx - 4} 217 C ${cx - 6} 219, ${cx - 12} 219.5, ${cx - 14} 218 Z`}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
            />
            <path
              d={`M ${cx + 14} 218 C ${cx + 12} 215, ${cx + 6} 215, ${cx + 4} 217 C ${cx + 6} 219, ${cx + 12} 219.5, ${cx + 14} 218 Z`}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
            />

            {/* Wide Sturdy Columella */}
            <path
              d={`M ${cx - 4} 217 C ${cx - 2} 220.5, ${cx + 2} 220.5, ${cx + 4} 217`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx - 3.5} 221 C ${cx} 222.5, ${cx + 3.5} 221, ${cx + 3.5} 221`}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.0"
              strokeDasharray="1.5 1.5"
              className="opacity-50"
            />

            {/* Broad Philtrum Columns */}
            <line x1={cx - 4.5} y1={224} x2={cx - 5.5} y2={235} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 4.5} y1={224} x2={cx + 5.5} y2={235} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_narrow":
        return (
          <g id="forensic-nose-narrow">
            {/* Tightly set Slender Root */}
            <path
              d={`M ${cx - 3.5} 148 C ${cx - 3} 154, ${cx - 2.5} 160, ${cx - 2.5} 166`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="0.9"
              strokeDasharray="1.5 2"
              className="opacity-60"
            />
            <path
              d={`M ${cx + 3.5} 148 C ${cx + 3} 154, ${cx + 2.5} 160, ${cx + 2.5} 166`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.1"
              className="opacity-70"
            />

            {/* Ultra-Slender Pinched Dorsal Ridge (only 4.5px wide) */}
            <line x1={cx - 2.2} y1={166} x2={cx - 2.2} y2={204} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-50" />
            <line x1={cx + 2.2} y1={166} x2={cx + 2.2} y2={204} stroke="#FFFFFF" strokeWidth="1.3" className="opacity-90" />
            <line x1={cx} y1={166} x2={cx} y2={203} stroke="#FFFFFF" strokeWidth="0.7" className="opacity-50" />

            {/* Petite Compact Tip Lobule (span 7.5px) */}
            <path
              d={`M ${cx - 3.5} 207 C ${cx - 1.8} 205.5, ${cx + 1.8} 205.5, ${cx + 3.5} 207`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              className="opacity-70"
            />
            <path
              d={`M ${cx - 4} 213 C ${cx - 2} 215.5, ${cx + 2} 215.5, ${cx + 4} 213`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Petite, Tight Alar Wings (compact 22px span, cx-11 to cx+11) */}
            <path
              d={`M ${cx - 10} 210 C ${cx - 12} 213, ${cx - 11.5} 217, ${cx - 7} 218.5`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 10} 210 C ${cx + 12} 213, ${cx + 11.5} 217, ${cx + 7} 218.5`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.3"
              strokeLinecap="round"
            />

            {/* Slender Vertical Nostril Slits (tilted oval slits) */}
            <ellipse
              cx={cx - 5.5}
              cy={217}
              rx={1.2}
              ry={2.1}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.6"
              transform={`rotate(14 ${cx - 5.5} 217)`}
            />
            <ellipse
              cx={cx + 5.5}
              cy={217}
              rx={1.2}
              ry={2.1}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.6"
              transform={`rotate(-14 ${cx + 5.5} 217)`}
            />

            {/* Petite Delicate Columella */}
            <path
              d={`M ${cx - 2} 216.5 C ${cx - 1} 219, ${cx + 1} 219, ${cx + 2} 216.5`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.3"
              strokeLinecap="round"
            />

            {/* Narrow Philtrum */}
            <line x1={cx - 2} y1={222} x2={cx - 2} y2={234} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1.5 2" className="opacity-35" />
            <line x1={cx + 2} y1={222} x2={cx + 2} y2={234} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1.5 2" className="opacity-35" />
          </g>
        );

      case "nose_rounded":
        return (
          <g id="forensic-nose-rounded">
            {/* Moderate Root */}
            <path
              d={`M ${cx - 5} 148 C ${cx - 4} 154, ${cx - 3.5} 160, ${cx - 4} 166`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              strokeDasharray="1.5 2"
              className="opacity-60"
            />
            <path
              d={`M ${cx + 5} 148 C ${cx + 4} 154, ${cx + 3.5} 160, ${cx + 4} 166`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              className="opacity-70"
            />

            {/* Tapering bridge flowing into expanding bulbous base */}
            <line x1={cx - 3.8} y1={166} x2={cx - 4.5} y2={201} stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" className="opacity-50" />
            <line x1={cx + 3.8} y1={166} x2={cx + 4.5} y2={201} stroke="#FFFFFF" strokeWidth="1.3" className="opacity-90" />

            {/* Distinct Bulbous Spherical Tip Lobule */}
            {/* Upper spherical dome of bulbous tip */}
            <path
              d={`M ${cx - 7.5} 207 C ${cx - 7.5} 202, ${cx - 4} 200, ${cx} 200 C ${cx + 4} 200, ${cx + 7.5} 202, ${cx + 7.5} 207`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.2"
              className="opacity-75"
            />
            {/* Lower spherical contour of bulbous tip */}
            <path
              d={`M ${cx - 8} 211 C ${cx - 5} 216.5, ${cx + 5} 216.5, ${cx + 8} 211`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            {/* Bulbous tip specular shine contour */}
            <ellipse cx={cx - 1.5} cy={206.5} rx={2.4} ry={1.8} fill="#FFFFFF" opacity="0.3" />

            {/* Fleshy, Smooth Curved Alar Wings */}
            <path
              d={`M ${cx - 15} 209 C ${cx - 18.5} 212, ${cx - 18} 218, ${cx - 11.5} 220`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 15} 209 C ${cx + 18.5} 212, ${cx + 18} 218, ${cx + 11.5} 220`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Rounded Nostril Apertures */}
            <path
              d={`M ${cx - 11} 218 C ${cx - 10} 215.5, ${cx - 5.5} 215.5, ${cx - 3.5} 217 C ${cx - 5.5} 219, ${cx - 10} 219, ${cx - 11} 218 Z`}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
            />
            <path
              d={`M ${cx + 11} 218 C ${cx + 10} 215.5, ${cx + 5.5} 215.5, ${cx + 3.5} 217 C ${cx + 5.5} 219, ${cx + 10} 219, ${cx + 11} 218 Z`}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
            />

            {/* Soft Rounded Columella */}
            <path
              d={`M ${cx - 3.5} 217 C ${cx - 2} 220, ${cx + 2} 220, ${cx + 3.5} 217`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Philtrum columns */}
            <line x1={cx - 3.5} y1={223} x2={cx - 4} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 3.5} y1={223} x2={cx + 4} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_pointed":
        return (
          <g id="forensic-nose-pointed">
            {/* High Chiseled Root */}
            <line x1={cx - 4} y1={148} x2={cx - 3.5} y2={166} stroke="#CBD5E1" strokeWidth="1.1" strokeDasharray="1.5 2" className="opacity-60" />
            <line x1={cx + 4} y1={148} x2={cx + 3.5} y2={166} stroke="#FFFFFF" strokeWidth="1.4" className="opacity-90" />

            {/* Chiseled Knife-Edge Dorsal Ridge */}
            <line x1={cx - 3.5} y1={166} x2={cx - 2.8} y2={202} stroke="#CBD5E1" strokeWidth="1.0" className="opacity-60" />
            <line x1={cx + 3.5} y1={166} x2={cx + 2.8} y2={202} stroke="#FFFFFF" strokeWidth="1.6" className="opacity-100" />
            {/* Sharp central ridge highlight */}
            <line x1={cx} y1={164} x2={cx} y2={204} stroke="#FFFFFF" strokeWidth="0.9" className="opacity-80" />

            {/* Acute Triangular Supratip Break & Apex */}
            <path
              d={`M ${cx - 4.5} 204 L ${cx} 211 L ${cx + 4.5} 204`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d={`M ${cx - 6} 211 L ${cx} 217.5 L ${cx + 6} 211`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Taut, Angular Alar Wings */}
            <path
              d={`M ${cx - 14} 209 L ${cx - 16.5} 213.5 L ${cx - 9} 218`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M ${cx + 14} 209 L ${cx + 16.5} 213.5 L ${cx + 9} 218`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Angular Triangular Nostril Apertures */}
            <polygon
              points={`${cx - 9.5},217 ${cx - 5.5},214.5 ${cx - 3},216.5`}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
            />
            <polygon
              points={`${cx + 9.5},217 ${cx + 5.5},214.5 ${cx + 3},216.5`}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
            />

            {/* Pointed V-Shaped Columella Base */}
            <path
              d={`M ${cx - 3} 216.5 L ${cx} 220 L ${cx + 3} 216.5`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Philtrum columns */}
            <line x1={cx - 3} y1={223} x2={cx - 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 3} y1={223} x2={cx + 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_upturned":
        return (
          <g id="forensic-nose-upturned">
            {/* Concave Bridge Curve (ski-slope dorsum dipping inward before rising) */}
            <path
              d={`M ${cx - 5} 148 C ${cx - 3.5} 160, ${cx - 3} 176, ${cx - 4.5} 196`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              strokeDasharray="1.5 2"
              className="opacity-60"
            />
            <path
              d={`M ${cx + 5} 148 C ${cx + 3.5} 160, ${cx + 3} 176, ${cx + 4.5} 196`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.3"
              className="opacity-90"
            />

            {/* Elevated Tip Lobule (notice tip apex sits higher at y: 205) */}
            <path
              d={`M ${cx - 5.5} 199 C ${cx - 3} 196.5, ${cx + 3} 196.5, ${cx + 5.5} 199`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.2"
              className="opacity-75"
            />
            <path
              d={`M ${cx - 6} 205 C ${cx - 3} 207.5, ${cx + 3} 207.5, ${cx + 6} 205`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <circle cx={cx - 1} cy={201} r={1.6} fill="#FFFFFF" opacity="0.6" />

            {/* High-Arched Alar Wings (elevated to y: 204 - 214) */}
            <path
              d={`M ${cx - 15} 204 C ${cx - 18} 207, ${cx - 17} 212, ${cx - 12} 214`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 15} 204 C ${cx + 18} 207, ${cx + 17} 212, ${cx + 12} 214`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />

            {/* Fully Visible Front-Facing Oval Nostril Apertures */}
            <ellipse
              cx={cx - 7.5}
              cy={210}
              rx={3.2}
              ry={2.2}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
              transform={`rotate(-22 ${cx - 7.5} 210)`}
            />
            <ellipse
              cx={cx + 7.5}
              cy={210}
              rx={3.2}
              ry={2.2}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
              transform={`rotate(22 ${cx + 7.5} 210)`}
            />

            {/* Prominent Descending Columella Pillar */}
            <path
              d={`M ${cx - 3} 206 C ${cx - 1.5} 212, ${cx + 1.5} 212, ${cx + 3} 206`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx - 3} 213 C ${cx} 215, ${cx + 3} 213, ${cx + 3} 213`}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.1"
              strokeDasharray="1.5 1.5"
              className="opacity-60"
            />

            {/* Extended Philtrum Column */}
            <line x1={cx - 3} y1={216} x2={cx - 3.5} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-45" />
            <line x1={cx + 3} y1={216} x2={cx + 3.5} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-45" />
          </g>
        );

      case "nose_broken":
        return (
          <g id="forensic-nose-broken">
            {/* Traumatic Deviated Dorsal Bridge with Mid-shaft Lateral Shift */}
            <path
              d={`M ${cx - 5} 148 C ${cx - 4} 158, ${cx - 8} 172, ${cx - 4} 184 C ${cx} 194, ${cx - 2} 202, ${cx} 208`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeDasharray="1.5 2"
              className="opacity-70"
            />
            <path
              d={`M ${cx + 5} 148 C ${cx + 6} 158, ${cx + 2} 172, ${cx + 7} 184 C ${cx + 10} 194, ${cx + 8} 202, ${cx + 4} 208`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Healed Fracture Callus Notch */}
            <line x1={cx - 1} y1={174} x2={cx + 5} y2={173} stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
            <line x1={cx - 4} y1={175} x2={cx} y2={176} stroke="#CBD5E1" strokeWidth="1.0" />

            {/* Asymmetrical Tip Lobule */}
            <path
              d={`M ${cx - 6} 208 C ${cx - 3} 212, ${cx + 5} 210, ${cx + 7} 207`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Asymmetric Alar Wings */}
            <path
              d={`M ${cx - 16} 207 C ${cx - 19} 210, ${cx - 17} 216, ${cx - 11} 217`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 13} 205 C ${cx + 16} 208, ${cx + 16} 214, ${cx + 10} 215`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Asymmetric Nostril Slits */}
            <ellipse cx={cx - 8.5} cy={214.5} rx={3.0} ry={1.8} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            <ellipse cx={cx + 8} cy={213} rx={2.4} ry={1.6} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            {/* Philtrum */}
            <line x1={cx - 2} y1={220} x2={cx - 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 4} y1={220} x2={cx + 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_aquiline":
        return (
          <g id="forensic-nose-aquiline">
            {/* Convex Roman Dorsal Hump */}
            <path
              d={`M ${cx - 5} 148 C ${cx - 3} 160, ${cx - 2} 174, ${cx - 4} 188 C ${cx - 6} 198, ${cx - 4} 206, ${cx} 212`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeDasharray="1.5 2"
              className="opacity-60"
            />
            <path
              d={`M ${cx + 5} 148 C ${cx + 8} 164, ${cx + 9} 176, ${cx + 6} 190 C ${cx + 3} 200, ${cx + 1} 208, ${cx} 212`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            {/* Dorsal Hump Apex Hatching */}
            <path
              d={`M ${cx + 1} 172 C ${cx + 5} 172, ${cx + 7} 176, ${cx + 5} 182`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              className="opacity-75"
            />
            {/* Downward Hooked Tip Apex */}
            <path
              d={`M ${cx - 5} 210 C ${cx} 215, ${cx} 216, ${cx + 5} 210`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            {/* Alar wings */}
            <path
              d={`M ${cx - 15} 206 C ${cx - 18} 210, ${cx - 16} 216, ${cx - 10} 217`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 15} 206 C ${cx + 18} 210, ${cx + 16} 216, ${cx + 10} 217`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <ellipse cx={cx - 8} cy={214} rx={2.8} ry={1.8} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            <ellipse cx={cx + 8} cy={214} rx={2.8} ry={1.8} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            <line x1={cx - 2.5} y1={220} x2={cx - 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 2.5} y1={220} x2={cx + 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_bulbous":
        return (
          <g id="forensic-nose-bulbous">
            {/* Broad bridge descending into wide spherical lower lobule */}
            <line x1={cx - 6} y1={148} x2={cx - 5} y2={196} stroke="#94A3B8" strokeWidth="1.1" strokeDasharray="1.5 2" className="opacity-60" />
            <line x1={cx + 6} y1={148} x2={cx + 5} y2={196} stroke="#FFFFFF" strokeWidth="1.4" className="opacity-85" />
            {/* Spherical Fleshy Tip Bulb */}
            <ellipse cx={cx} cy={206} rx={9.5} ry={7.5} fill="rgba(241, 245, 249, 0.08)" stroke="#FFFFFF" strokeWidth="1.8" />
            <ellipse cx={cx - 2} cy={204} rx={3.2} ry={2.0} fill="#FFFFFF" opacity={0.35} />
            {/* Broad Alar Flare */}
            <path
              d={`M ${cx - 16} 206 C ${cx - 21} 210, ${cx - 20} 218, ${cx - 12} 220`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 16} 206 C ${cx + 21} 210, ${cx + 20} 218, ${cx + 12} 220`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <ellipse cx={cx - 10} cy={217} rx={3.5} ry={2.2} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            <ellipse cx={cx + 10} cy={217} rx={3.5} ry={2.2} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            <line x1={cx - 4} y1={222} x2={cx - 4} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 4} y1={222} x2={cx + 4} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_hawk":
        return (
          <g id="forensic-nose-hawk">
            {/* High Sharp Dorsal Bridge */}
            <line x1={cx - 4} y1={148} x2={cx - 3} y2={192} stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" className="opacity-60" />
            <line x1={cx + 4} y1={148} x2={cx + 3} y2={192} stroke="#FFFFFF" strokeWidth="1.4" className="opacity-90" />
            {/* Beaked Sharp Hook Apex */}
            <path
              d={`M ${cx - 4} 196 C ${cx - 3} 206, ${cx} 218, ${cx} 220 C ${cx} 218, ${cx + 3} 206, ${cx + 4} 196`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Compressed Alar Wings */}
            <path
              d={`M ${cx - 13} 206 C ${cx - 16} 209, ${cx - 15} 214, ${cx - 9} 215`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 13} 206 C ${cx + 16} 209, ${cx + 16} 214, ${cx + 9} 215`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <ellipse cx={cx - 7} cy={213} rx={2.4} ry={1.6} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            <ellipse cx={cx + 7} cy={213} rx={2.4} ry={1.6} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            <line x1={cx - 2.5} y1={222} x2={cx - 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 2.5} y1={222} x2={cx + 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_piercing":
        return (
          <g id="forensic-nose-piercing">
            {/* Balanced Nose Architecture */}
            <line x1={cx - 3.5} y1={166} x2={cx - 3.5} y2={202} stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" className="opacity-50" />
            <line x1={cx + 3.5} y1={166} x2={cx + 3.5} y2={202} stroke="#FFFFFF" strokeWidth="1.3" className="opacity-90" />
            <path
              d={`M ${cx - 5.5} 206 C ${cx - 3} 208, ${cx + 3} 208, ${cx + 5.5} 206`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Alar wings */}
            <path
              d={`M ${cx - 14} 206 C ${cx - 17} 209, ${cx - 16} 215, ${cx - 10} 217`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 14} 206 C ${cx + 17} 209, ${cx + 16} 215, ${cx + 10} 217`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <ellipse cx={cx - 8} cy={215} rx={3} ry={1.8} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            <ellipse cx={cx + 8} cy={215} rx={3} ry={1.8} fill="#0F172A" stroke="#1E293B" strokeWidth="0.8" />
            {/* High-Contrast Silver Metallic Nostril Stud on Right Alar Wing */}
            <circle cx={cx + 16} cy={212} r="2.8" fill="#0F172A" />
            <circle cx={cx + 16} cy={212} r="2.2" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.8" />
            <circle cx={cx + 15.4} cy={211.4} r="0.7" fill="#FFFFFF" />
            {/* Philtrum */}
            <line x1={cx - 3} y1={220} x2={cx - 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 3} y1={220} x2={cx + 3} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_straight":
      default:
        return (
          <g id="forensic-nose-straight">
            {/* Glabella / Brow root transition */}
            <path
              d={`M ${cx - 5} 148 C ${cx - 4} 154, ${cx - 3} 160, ${cx - 3} 166`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              strokeDasharray="1.5 2"
              className="opacity-60"
            />
            <path
              d={`M ${cx + 5} 148 C ${cx + 4} 154, ${cx + 3} 160, ${cx + 3} 166`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              className="opacity-70"
            />

            {/* Straight Parallel Dorsal Ridge */}
            <line x1={cx - 3.5} y1={166} x2={cx - 3.5} y2={202} stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" className="opacity-50" />
            <line x1={cx + 3.5} y1={166} x2={cx + 3.5} y2={202} stroke="#FFFFFF" strokeWidth="1.3" className="opacity-90" />
            <line x1={cx - 0.5} y1={168} x2={cx - 0.5} y2={200} stroke="#FFFFFF" strokeWidth="0.8" className="opacity-40" />

            {/* Tip Lobule: Balanced supratip crease & apex curve */}
            <path
              d={`M ${cx - 5.5} 206 C ${cx - 3} 204, ${cx + 3} 204, ${cx + 5.5} 206`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              className="opacity-70"
            />
            <path
              d={`M ${cx - 6} 212 C ${cx - 3} 215, ${cx + 3} 215, ${cx + 6} 212`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* Alar Wings: Balanced open curves */}
            <path
              d={`M ${cx - 14} 208 C ${cx - 17} 212, ${cx - 16} 217, ${cx - 10} 219`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 14} 208 C ${cx + 17} 212, ${cx + 16} 217, ${cx + 10} 219`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
            />

            {/* Nostril Apertures: Subtle realistic crescent slits */}
            <path
              d={`M ${cx - 10} 217 C ${cx - 9} 215, ${cx - 5} 215, ${cx - 3} 216.5 C ${cx - 5} 218, ${cx - 9} 218, ${cx - 10} 217 Z`}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
            />
            <path
              d={`M ${cx + 10} 217 C ${cx + 9} 215, ${cx + 5} 215, ${cx + 3} 216.5 C ${cx + 5} 218, ${cx + 9} 218, ${cx + 10} 217 Z`}
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="0.8"
            />

            {/* Central Columella */}
            <path
              d={`M ${cx - 3} 216.5 C ${cx - 1.5} 219.5, ${cx + 1.5} 219.5, ${cx + 3} 216.5`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx - 2} 220 C ${cx} 221.5, ${cx + 2} 220, ${cx + 2} 220`}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.0"
              strokeDasharray="1.5 1.5"
              className="opacity-50"
            />

            {/* Philtrum columns */}
            <line x1={cx - 3} y1={223} x2={cx - 3.5} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 3} y1={223} x2={cx + 3.5} y2={234} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_button":
        return (
          <g id="forensic-nose-button">
            {/* Slender Glabella & Narrow Upper Bridge */}
            <line x1={cx - 2.5} y1={168} x2={cx - 2.5} y2={202} stroke="#94A3B8" strokeWidth="0.9" strokeDasharray="1.5 2" className="opacity-50" />
            <line x1={cx + 2.5} y1={168} x2={cx + 2.5} y2={202} stroke="#FFFFFF" strokeWidth="1.2" className="opacity-90" />
            {/* Petite rounded button tip */}
            <path d={`M ${cx - 4.5} 205 C ${cx - 2} 203, ${cx + 2} 203, ${cx + 4.5} 205`} fill="none" stroke="#94A3B8" strokeWidth="1.0" className="opacity-70" />
            <path d={`M ${cx - 4.5} 210 C ${cx - 2} 213, ${cx + 2} 213, ${cx + 4.5} 210`} fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Delicate petite alar wings */}
            <path d={`M ${cx - 10} 208 C ${cx - 13} 211, ${cx - 12} 215, ${cx - 8} 217`} fill="none" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
            <path d={`M ${cx + 10} 208 C ${cx + 13} 211, ${cx + 12} 215, ${cx + 8} 217`} fill="none" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
            {/* Small nostril apertures */}
            <ellipse cx={cx - 6} cy={215.5} rx={2.2} ry={1.2} fill="#0F172A" />
            <ellipse cx={cx + 6} cy={215.5} rx={2.2} ry={1.2} fill="#0F172A" />
            {/* Central columella */}
            <path d={`M ${cx - 2} 215 C ${cx - 1} 218, ${cx + 1} 218, ${cx + 2} 215`} fill="none" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
            {/* Philtrum columns */}
            <line x1={cx - 2.5} y1={221} x2={cx - 3} y2={234} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 2.5} y1={221} x2={cx + 3} y2={234} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_slender_sculpted":
        return (
          <g id="forensic-nose-slender">
            {/* Sleek straight sculpted bridge */}
            <line x1={cx - 2.5} y1={162} x2={cx - 2.5} y2={204} stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" className="opacity-50" />
            <line x1={cx + 2.5} y1={162} x2={cx + 2.5} y2={204} stroke="#FFFFFF" strokeWidth="1.4" className="opacity-95" />
            {/* Defined refined supratip */}
            <path d={`M ${cx - 5} 205 C ${cx - 2.5} 203.5, ${cx + 2.5} 203.5, ${cx + 5} 205`} fill="none" stroke="#94A3B8" strokeWidth="1.0" className="opacity-70" />
            <path d={`M ${cx - 5} 211 C ${cx - 2.5} 214, ${cx + 2.5} 214, ${cx + 5} 211`} fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
            {/* Slender alar contours */}
            <path d={`M ${cx - 11} 208 C ${cx - 14} 211, ${cx - 13} 216, ${cx - 8.5} 218`} fill="none" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
            <path d={`M ${cx + 11} 208 C ${cx + 14} 211, ${cx + 13} 216, ${cx + 8.5} 218`} fill="none" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
            {/* Nostrils */}
            <ellipse cx={cx - 6.5} cy={216} rx={2.5} ry={1.3} fill="#0F172A" />
            <ellipse cx={cx + 6.5} cy={216} rx={2.5} ry={1.3} fill="#0F172A" />
            {/* Central Columella */}
            <path d={`M ${cx - 2.5} 216 C ${cx - 1} 219, ${cx + 1} 219, ${cx + 2.5} 216`} fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
            {/* Philtrum */}
            <line x1={cx - 2.5} y1={222} x2={cx - 3} y2={234} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1.5 2" className="opacity-40" />
            <line x1={cx + 2.5} y1={222} x2={cx + 3} y2={234} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1.5 2" className="opacity-40" />
          </g>
        );

      case "nose_septum":
        return (
          <g id="forensic-nose-septum">
            {/* Standard straight nose bridge */}
            <line x1={cx - 3.5} y1={166} x2={cx - 3.5} y2={202} stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" className="opacity-50" />
            <line x1={cx + 3.5} y1={166} x2={cx + 3.5} y2={202} stroke="#FFFFFF" strokeWidth="1.3" className="opacity-90" />
            <path d={`M ${cx - 6} 212 C ${cx - 3} 215, ${cx + 3} 215, ${cx + 6} 212`} fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
            <path d={`M ${cx - 14} 208 C ${cx - 17} 212, ${cx - 16} 217, ${cx - 10} 219`} fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
            <path d={`M ${cx + 14} 208 C ${cx + 17} 212, ${cx + 16} 217, ${cx + 10} 219`} fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
            <ellipse cx={cx - 7} cy={216.5} rx={3} ry={1.5} fill="#0F172A" />
            <ellipse cx={cx + 7} cy={216.5} rx={3} ry={1.5} fill="#0F172A" />
            <path d={`M ${cx - 3} 216.5 C ${cx - 1.5} 219.5, ${cx + 1.5} 219.5, ${cx + 3} 216.5`} fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Septum Ring Horseshoe */}
            <circle cx={cx} cy={221} r="4.2" fill="none" stroke="#E2E8F0" strokeWidth="1.6" />
            <circle cx={cx - 3.5} cy={223.5} r="1.3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.6" />
            <circle cx={cx + 3.5} cy={223.5} r="1.3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.6" />
          </g>
        );
    }
  };

  return (
    <g ref={revealRef} id="forensic-layer-nose" className="forensic-sketch-feature">
      {renderNoseArtwork()}
    </g>
  );
}

/**
 * Forensic Mouth & Lips Layer
 * Only renders when a mouth feature is actively selected by the user.
 */
export function ForensicMouthLayer({
  selectedFeatures,
}: {
  selectedFeatures: Record<string, FeatureItem>;
}) {
  const mouthFeature = selectedFeatures["mouth_types"];
  const isVisible = Boolean(mouthFeature);
  const mouthShape = mouthFeature?.id || "mouth_medium";
  const triggerKey = isVisible ? `${mouthShape}` : undefined;

  // Unconditional hook call at top level for React 19 compliance
  const revealRef = useFeatureGSAPReveal(triggerKey, "160px 252px", 2);

  if (!isVisible) return null;

  let mouthHalfW = 21;
  let upperLipThick = 4.5;
  let lowerLipThick = 6;
  let commissureDrop = 0;

  switch (mouthShape) {
    case "mouth_thin":
      upperLipThick = 2.8;
      lowerLipThick = 3.8;
      break;
    case "mouth_full":
      upperLipThick = 6.5;
      lowerLipThick = 8.5;
      break;
    case "mouth_wide":
      mouthHalfW = 26;
      break;
    case "mouth_narrow":
      mouthHalfW = 16;
      break;
    case "mouth_downturned":
      commissureDrop = 2.5;
      break;
    case "mouth_cupid_bow":
      mouthHalfW = 19;
      upperLipThick = 5.2;
      lowerLipThick = 6.2;
      break;
    case "mouth_pillowy_plump":
      mouthHalfW = 22;
      upperLipThick = 7.5;
      lowerLipThick = 9.5;
      break;
    case "mouth_rosebud":
      mouthHalfW = 15;
      upperLipThick = 5.5;
      lowerLipThick = 6.5;
      break;
    case "mouth_delicate_natural":
      mouthHalfW = 18;
      upperLipThick = 3.8;
      lowerLipThick = 4.8;
      break;
    case "mouth_medium":
    default:
      mouthHalfW = 21;
      upperLipThick = 4.5;
      lowerLipThick = 6;
      break;
  }

  const cx = 160;
  const stomionY = 252;

  const leftX = cx - mouthHalfW;
  const rightX = cx + mouthHalfW;
  const leftY = stomionY + commissureDrop;
  const rightY = stomionY + commissureDrop;

  return (
    <g ref={revealRef} id="forensic-layer-mouth" className="forensic-sketch-feature">
      {/* Upper Vermilion with Cupid's bow */}
      <path
        d={`M ${leftX} ${leftY} C ${cx - mouthHalfW * 0.5} ${stomionY - upperLipThick * 0.7}, ${cx - 4} ${stomionY - upperLipThick}, ${cx} ${stomionY - upperLipThick * 0.6} C ${cx + 4} ${stomionY - upperLipThick}, ${cx + mouthHalfW * 0.5} ${stomionY - upperLipThick * 0.7}, ${rightX} ${rightY}`}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Central Oral Fissure (Subtle natural dividing line) */}
      <path
        d={`M ${leftX} ${leftY} C ${cx - 6} ${stomionY - 0.8}, ${cx - 3} ${stomionY + 1.2}, ${cx} ${stomionY + 1.2} C ${cx + 3} ${stomionY + 1.2}, ${cx + 6} ${stomionY - 0.8}, ${rightX} ${rightY}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Lower Vermilion Contour */}
      <path
        d={`M ${leftX + 2} ${leftY + 0.5} C ${cx - mouthHalfW * 0.4} ${stomionY + lowerLipThick}, ${cx + mouthHalfW * 0.4} ${stomionY + lowerLipThick}, ${rightX - 2} ${rightY + 0.5}`}
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Gentle Sub-lip indent hint */}
      <path
        d={`M ${cx - 8} ${stomionY + lowerLipThick + 5} C ${cx - 4} ${stomionY + lowerLipThick + 6.5}, ${cx + 4} ${stomionY + lowerLipThick + 6.5}, ${cx + 8} ${stomionY + lowerLipThick + 5}`}
        fill="none"
        stroke="#94A3B8"
        strokeWidth="0.9"
        strokeLinecap="round"
        className="opacity-50"
      />
    </g>
  );
}

/**
 * Forensic Oral Dentition (Teeth) Layer
 * Renders parted incisors, central diastema gap, crooked teeth, or gold cap crown.
 */
export function ForensicTeethLayer({
  selectedFeatures,
}: {
  selectedFeatures: Record<string, FeatureItem>;
}) {
  const teethItem = selectedFeatures["teeth_details"];
  const teethId = teethItem?.id;
  const isVisible = Boolean(teethId);
  const revealRef = useFeatureGSAPReveal(isVisible ? teethId : undefined, "160px 246px", 1.5);

  if (!isVisible) return null;

  const cx = 160;

  return (
    <g id="forensic-teeth-layer" ref={revealRef}>
      {/* 1. Parted Lips with Clean Incisors */}
      {teethId === "mouth_teeth_parted" && (
        <g id="forensic-teeth-parted">
          <rect x={cx - 6} y={244.5} width={5.5} height={5.5} rx={0.6} fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
          <rect x={cx + 0.5} y={244.5} width={5.5} height={5.5} rx={0.6} fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
          <rect x={cx - 11} y={245} width={4.5} height={4.8} rx={0.5} fill="#E2E8F0" stroke="#334155" strokeWidth="0.7" />
          <rect x={cx + 6.5} y={245} width={4.5} height={4.8} rx={0.5} fill="#E2E8F0" stroke="#334155" strokeWidth="0.7" />
        </g>
      )}

      {/* 2. Central Diastema (Gap Tooth) */}
      {teethId === "mouth_diastema" && (
        <g id="forensic-teeth-diastema">
          <rect x={cx - 6.8} y={244.5} width={5.2} height={5.5} rx={0.6} fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
          {/* Prominent dark dental gap */}
          <line x1={cx} y1={244.5} x2={cx} y2={250} stroke="#0A0E17" strokeWidth="1.8" />
          <rect x={cx + 1.6} y={244.5} width={5.2} height={5.5} rx={0.6} fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
        </g>
      )}

      {/* 3. Crooked / Overlapping Teeth */}
      {teethId === "mouth_crooked_teeth" && (
        <g id="forensic-teeth-crooked">
          <polygon points={`${cx - 7},244.5 ${cx - 1.5},245 ${cx - 2},250 ${cx - 7.5},249.5`} fill="#FFFFFF" stroke="#334155" strokeWidth="0.8" />
          <polygon points={`${cx - 2.5},244.2 ${cx + 4.5},244.7 ${cx + 4},250 ${cx - 2.5},249.5`} fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.0" />
          <polygon points={`${cx + 4.5},244.8 ${cx + 9},245.5 ${cx + 8.5},249.8 ${cx + 4},249.5`} fill="#E2E8F0" stroke="#334155" strokeWidth="0.7" />
        </g>
      )}

      {/* 4. Gold Cap / Crown */}
      {teethId === "mouth_gold_tooth" && (
        <g id="forensic-teeth-gold">
          <rect x={cx - 6} y={244.5} width={5.5} height={5.5} rx={0.6} fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
          {/* Gleaming Gold Right Central Incisor */}
          <rect x={cx + 0.5} y={244.5} width={5.5} height={5.5} rx={0.6} fill="#EAB308" stroke="#854D0E" strokeWidth="0.9" />
          <polygon points={`${cx + 2},245.5 ${cx + 3.8},245.5 ${cx + 1.5},248.5`} fill="#FEF08A" opacity={0.8} />
        </g>
      )}
    </g>
  );
}

/**
 * Forensic Hair & Hairline Layer
 * Only renders when a hair feature is actively selected by the user.
 */
export function ForensicHairLayer({
  selectedFeatures,
  cranialParams,
}: {
  selectedFeatures: Record<string, FeatureItem>;
  cranialParams: CranialAnchorPoints;
}) {
  const hairId = selectedFeatures["hair_styles"]?.id || selectedFeatures["other_features"]?.id;
  const hairlineId = selectedFeatures["hairline"]?.id || selectedFeatures["other_features"]?.id;
  const isHair = Boolean(
    (hairId && (hairId.startsWith("hair_") || hairId.startsWith("other_hair"))) ||
      (hairlineId && hairlineId.startsWith("other_hairline"))
  );

  const triggerKey = isHair
    ? [hairId, hairlineId].filter(Boolean).join("_")
    : undefined;

  // Unconditional hook call at top level for React 19 compliance
  const revealRef = useFeatureGSAPReveal(triggerKey, "160px 90px", 3);

  if (!isHair) return null;

  const cx = 160;
  const crownY = cranialParams.crownY;
  const crWidth = cranialParams.parietalX - cx;

  return (
    <g ref={revealRef} id="forensic-layer-hair" className="forensic-sketch-feature">
      {/* 1. Short Crop */}
      {(hairId === "hair_short" || hairId === "other_hair_short") && (() => {
        const topY = crownY - 9;
        const pWidth = crWidth + 5;
        const prX = cx + pWidth;
        const prY = cranialParams.parietalY - 4;
        const tmX = cranialParams.templeX + 3;
        const tmY = cranialParams.templeY;
        const sbX = cranialParams.earRootX - 4;
        const sbY = cranialParams.earRootY + 22;

        const lprX = cx - pWidth;
        const ltmX = cx - (tmX - cx);
        const lsbX = cx - (sbX - cx);

        // Volumetric short hair cap outer contour
        const outerCap =
          `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
          `C ${(lsbX - 2).toFixed(2)} ${(sbY - 18).toFixed(2)}, ${(ltmX - 2).toFixed(2)} ${(tmY - 16).toFixed(2)}, ${(ltmX - 1).toFixed(2)} ${(tmY - 26).toFixed(2)} ` +
          `C ${(lprX - 3).toFixed(2)} ${(prY + 12).toFixed(2)}, ${(lprX - 2).toFixed(2)} ${(prY - 14).toFixed(2)}, ${(lprX + 6).toFixed(2)} ${(prY - 28).toFixed(2)} ` +
          `C ${(cx - pWidth * 0.5).toFixed(2)} ${(topY - 2).toFixed(2)}, ${(cx - 18).toFixed(2)} ${topY.toFixed(2)}, ${cx} ${topY.toFixed(2)} ` +
          `C ${(cx + 18).toFixed(2)} ${topY.toFixed(2)}, ${(cx + pWidth * 0.5).toFixed(2)} ${(topY - 2).toFixed(2)}, ${(prX - 6).toFixed(2)} ${(prY - 28).toFixed(2)} ` +
          `C ${(prX + 2).toFixed(2)} ${(prY - 14).toFixed(2)}, ${(prX + 3).toFixed(2)} ${(prY + 12).toFixed(2)}, ${(tmX + 1).toFixed(2)} ${(tmY - 26).toFixed(2)} ` +
          `C ${(tmX + 2).toFixed(2)} ${(tmY - 16).toFixed(2)}, ${(sbX + 2).toFixed(2)} ${(sbY - 18).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`;

        // Natural cropped frontal hairline & fringe
        const frontHairline =
          `C ${(sbX - 6).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${(cx + 56).toFixed(2)} 122, ${(cx + 50).toFixed(2)} 108 ` +
          `C ${(cx + 46).toFixed(2)} 98, ${(cx + 34).toFixed(2)} 92, ${(cx + 18).toFixed(2)} 91 ` +
          `C ${(cx + 4).toFixed(2)} 90, ${(cx - 6).toFixed(2)} 92, ${(cx - 18).toFixed(2)} 91 ` +
          `C ${(cx - 34).toFixed(2)} 92, ${(cx - 46).toFixed(2)} 98, ${(cx - 50).toFixed(2)} 108 ` +
          `C ${(cx - 56).toFixed(2)} 122, ${(lsbX + 6).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${lsbX.toFixed(2)} ${sbY.toFixed(2)} Z`;

        return (
          <g id="forensic-hair-short">
            {/* Volumetric Hair Mass Fill & Contour */}
            <path
              d={`${outerCap} ${frontHairline}`}
              fill="rgba(16, 19, 29, 0.65)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Frontal Hairline Defined Stroke */}
            <path
              d={
                `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(lsbX + 6).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${(cx - 56).toFixed(2)} 122, ${(cx - 50).toFixed(2)} 108 ` +
                `C ${(cx - 46).toFixed(2)} 98, ${(cx - 34).toFixed(2)} 92, ${(cx - 18).toFixed(2)} 91 ` +
                `C ${(cx - 6).toFixed(2)} 92, ${(cx + 4).toFixed(2)} 90, ${(cx + 18).toFixed(2)} 91 ` +
                `C ${(cx + 34).toFixed(2)} 92, ${(cx + 46).toFixed(2)} 98, ${(cx + 50).toFixed(2)} 108 ` +
                `C ${(cx + 56).toFixed(2)} 122, ${(sbX - 6).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.3"
              strokeLinecap="round"
            />

            {/* Off-center Parting Line */}
            <path
              d={`M ${(cx - 8).toFixed(2)} ${(topY + 2).toFixed(2)} C ${(cx - 10).toFixed(2)} ${(topY + 18).toFixed(2)}, ${(cx - 14).toFixed(2)} 70, ${(cx - 16).toFixed(2)} 91`}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />

            {/* Right Directional Flow Strokes */}
            <path
              d={`M ${(cx + 8).toFixed(2)} ${(topY + 8).toFixed(2)} C ${(cx + 32).toFixed(2)} ${(topY + 14).toFixed(2)}, ${(cx + 52).toFixed(2)} 70, ${(cx + 48).toFixed(2)} 96`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-75"
            />
            <path
              d={`M ${(cx + 22).toFixed(2)} ${(topY + 4).toFixed(2)} C ${(cx + 48).toFixed(2)} 56, ${(prX - 8).toFixed(2)} 82, ${(prX - 4).toFixed(2)} 112`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-60"
            />
            <path
              d={`M ${(tmX - 6).toFixed(2)} 126 C ${(tmX - 4).toFixed(2)} 138, ${(sbX + 1).toFixed(2)} 150, ${sbX.toFixed(2)} ${(sbY - 4).toFixed(2)}`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-60"
            />

            {/* Left Directional Flow Strokes */}
            <path
              d={`M ${(cx - 20).toFixed(2)} ${(topY + 8).toFixed(2)} C ${(cx - 36).toFixed(2)} ${(topY + 14).toFixed(2)}, ${(cx - 52).toFixed(2)} 70, ${(cx - 48).toFixed(2)} 96`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-75"
            />
            <path
              d={`M ${(cx - 28).toFixed(2)} ${(topY + 4).toFixed(2)} C ${(cx - 50).toFixed(2)} 56, ${(lprX + 8).toFixed(2)} 82, ${(lprX + 4).toFixed(2)} 112`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-60"
            />
            <path
              d={`M ${(ltmX + 6).toFixed(2)} 126 C ${(ltmX + 4).toFixed(2)} 138, ${(lsbX - 1).toFixed(2)} 150, ${lsbX.toFixed(2)} ${(sbY - 4).toFixed(2)}`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-60"
            />

            {/* Textured Fringe Tufts across Forehead */}
            <path
              d={`M ${(cx - 34).toFixed(2)} 93 C ${(cx - 28).toFixed(2)} 96, ${(cx - 22).toFixed(2)} 96, ${(cx - 16).toFixed(2)} 93`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d={`M ${(cx - 6).toFixed(2)} 93 C ${(cx).toFixed(2)} 96, ${(cx + 8).toFixed(2)} 96, ${(cx + 14).toFixed(2)} 93`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d={`M ${(cx + 20).toFixed(2)} 94 C ${(cx + 28).toFixed(2)} 97, ${(cx + 34).toFixed(2)} 97, ${(cx + 40).toFixed(2)} 94`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        );
      })()}

      {/* 2. Side Part */}
      {(hairId === "hair_side_part") && (() => {
        const topY = crownY - 11;
        const pWidth = crWidth + 6;
        const prX = cx + pWidth;
        const prY = cranialParams.parietalY - 3;
        const tmX = cranialParams.templeX + 4;
        const tmY = cranialParams.templeY;
        const sbX = cranialParams.earRootX - 3;
        const sbY = cranialParams.earRootY + 20;

        const lprX = cx - pWidth + 2;
        const ltmX = cx - (tmX - cx) + 2;
        const lsbX = cx - (sbX - cx) + 2;
        const partX = cx - 24;

        const outerCap =
          `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
          `C ${(lsbX - 2).toFixed(2)} ${(sbY - 16).toFixed(2)}, ${(ltmX - 1).toFixed(2)} ${(tmY - 14).toFixed(2)}, ${(ltmX).toFixed(2)} ${(tmY - 24).toFixed(2)} ` +
          `C ${(lprX - 1).toFixed(2)} ${(prY + 8).toFixed(2)}, ${(lprX).toFixed(2)} ${(prY - 12).toFixed(2)}, ${(lprX + 8).toFixed(2)} ${(prY - 24).toFixed(2)} ` +
          `C ${(cx - pWidth * 0.45).toFixed(2)} ${(topY + 3).toFixed(2)}, ${(partX - 8).toFixed(2)} ${(topY + 2).toFixed(2)}, ${partX.toFixed(2)} ${(topY + 3).toFixed(2)} ` +
          `C ${(partX + 12).toFixed(2)} ${(topY - 1).toFixed(2)}, ${(cx + 18).toFixed(2)} ${topY.toFixed(2)}, ${(cx + 34).toFixed(2)} ${(topY + 2).toFixed(2)} ` +
          `C ${(cx + pWidth * 0.55).toFixed(2)} ${(topY + 4).toFixed(2)}, ${(prX - 4).toFixed(2)} ${(prY - 22).toFixed(2)}, ${(prX + 2).toFixed(2)} ${(prY + 8).toFixed(2)} ` +
          `C ${(tmX + 2).toFixed(2)} ${(tmY - 20).toFixed(2)}, ${(tmX + 1).toFixed(2)} ${(tmY - 10).toFixed(2)}, ${(sbX + 1).toFixed(2)} ${(sbY - 14).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`;

        const frontHairline =
          `C ${(sbX - 5).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${(cx + 52).toFixed(2)} 116, ${(cx + 46).toFixed(2)} 104 ` +
          `C ${(cx + 38).toFixed(2)} 94, ${(cx + 16).toFixed(2)} 88, ${(partX + 8).toFixed(2)} 86 ` +
          `C ${(partX).toFixed(2)} 86, ${(partX - 4).toFixed(2)} 92, ${(cx - 36).toFixed(2)} 98 ` +
          `C ${(cx - 48).toFixed(2)} 106, ${(lsbX + 5).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${lsbX.toFixed(2)} ${sbY.toFixed(2)} Z`;

        return (
          <g id="forensic-hair-side-part">
            <path
              d={`${outerCap} ${frontHairline}`}
              fill="rgba(16, 19, 29, 0.68)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={
                `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(lsbX + 5).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${(cx - 48).toFixed(2)} 106, ${(cx - 36).toFixed(2)} 98 ` +
                `C ${(partX - 4).toFixed(2)} 92, ${(partX).toFixed(2)} 86, ${(partX + 8).toFixed(2)} 86 ` +
                `C ${(cx + 16).toFixed(2)} 88, ${(cx + 38).toFixed(2)} 94, ${(cx + 46).toFixed(2)} 104 ` +
                `C ${(cx + 52).toFixed(2)} 116, ${(sbX - 5).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${partX.toFixed(2)} ${(topY + 3).toFixed(2)} C ${(partX - 1).toFixed(2)} ${(topY + 20).toFixed(2)}, ${(partX - 2).toFixed(2)} 70, ${(partX - 3).toFixed(2)} 86`}
              fill="none"
              stroke="#FAFAFA"
              strokeWidth="1.4"
            />
            <path
              d={`M ${(partX + 10).toFixed(2)} ${(topY + 5).toFixed(2)} C ${(cx + 14).toFixed(2)} ${(topY + 14).toFixed(2)}, ${(cx + 40).toFixed(2)} 68, ${(cx + 42).toFixed(2)} 94`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-75"
            />
            <path
              d={`M ${(partX + 24).toFixed(2)} ${(topY + 3).toFixed(2)} C ${(cx + 32).toFixed(2)} ${(topY + 16).toFixed(2)}, ${(prX - 6).toFixed(2)} 76, ${(prX - 4).toFixed(2)} 106`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-65"
            />
            <path
              d={`M ${(partX + 4).toFixed(2)} 72 C ${(cx + 18).toFixed(2)} 78, ${(cx + 38).toFixed(2)} 88, ${(cx + 44).toFixed(2)} 102`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-70"
            />
            <path
              d={`M ${(partX - 8).toFixed(2)} ${(topY + 8).toFixed(2)} C ${(cx - 36).toFixed(2)} ${(topY + 18).toFixed(2)}, ${(lprX + 6).toFixed(2)} 76, ${(ltmX + 4).toFixed(2)} 104`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-65"
            />
            <path
              d={`M ${(lprX + 12).toFixed(2)} 78 C ${(ltmX + 6).toFixed(2)} 100, ${(lsbX + 2).toFixed(2)} 122, ${lsbX.toFixed(2)} ${(sbY - 6).toFixed(2)}`}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-60"
            />
          </g>
        );
      })()}

      {/* 3. Buzz Cut */}
      {(hairId === "hair_buzz") && (() => {
        const topY = crownY - 4;
        const pWidth = crWidth + 2;
        const prX = cx + pWidth;
        const prY = cranialParams.parietalY - 1;
        const tmX = cranialParams.templeX + 1;
        const tmY = cranialParams.templeY;
        const sbX = cranialParams.earRootX - 4;
        const sbY = cranialParams.earRootY + 16;

        const lprX = cx - pWidth;
        const ltmX = cx - (tmX - cx);
        const lsbX = cx - (sbX - cx);

        const outerCap =
          `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
          `C ${(lsbX - 1).toFixed(2)} ${(sbY - 14).toFixed(2)}, ${(ltmX - 1).toFixed(2)} ${(tmY - 12).toFixed(2)}, ${(ltmX).toFixed(2)} ${(tmY - 20).toFixed(2)} ` +
          `C ${(lprX - 1).toFixed(2)} ${(prY + 8).toFixed(2)}, ${(lprX).toFixed(2)} ${(prY - 10).toFixed(2)}, ${(lprX + 5).toFixed(2)} ${(prY - 20).toFixed(2)} ` +
          `C ${(cx - pWidth * 0.5).toFixed(2)} ${(topY - 1).toFixed(2)}, ${(cx - 16).toFixed(2)} ${topY.toFixed(2)}, ${cx} ${topY.toFixed(2)} ` +
          `C ${(cx + 16).toFixed(2)} ${topY.toFixed(2)}, ${(cx + pWidth * 0.5).toFixed(2)} ${(topY - 1).toFixed(2)}, ${(prX - 5).toFixed(2)} ${(prY - 20).toFixed(2)} ` +
          `C ${(prX).toFixed(2)} ${(prY - 10).toFixed(2)}, ${(prX + 1).toFixed(2)} ${(prY + 8).toFixed(2)}, ${(tmX).toFixed(2)} ${(tmY - 20).toFixed(2)} ` +
          `C ${(tmX + 1).toFixed(2)} ${(tmY - 12).toFixed(2)}, ${(sbX + 1).toFixed(2)} ${(sbY - 14).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`;

        const frontHairline =
          `C ${(sbX - 3).toFixed(2)} ${(sbY - 8).toFixed(2)}, ${(cx + 48).toFixed(2)} 112, ${(cx + 46).toFixed(2)} 100 ` +
          `C ${(cx + 44).toFixed(2)} 92, ${(cx + 36).toFixed(2)} 84, ${(cx + 24).toFixed(2)} 84 ` +
          `L ${(cx - 24).toFixed(2)} 84 ` +
          `C ${(cx - 36).toFixed(2)} 84, ${(cx - 44).toFixed(2)} 92, ${(cx - 46).toFixed(2)} 100 ` +
          `C ${(cx - 48).toFixed(2)} 112, ${(lsbX + 3).toFixed(2)} ${(sbY - 8).toFixed(2)}, ${lsbX.toFixed(2)} ${sbY.toFixed(2)} Z`;

        return (
          <g id="forensic-hair-buzz">
            <path
              d={`${outerCap} ${frontHairline}`}
              fill="rgba(24, 28, 39, 0.50)"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={
                `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(lsbX + 3).toFixed(2)} ${(sbY - 8).toFixed(2)}, ${(cx - 48).toFixed(2)} 112, ${(cx - 46).toFixed(2)} 100 ` +
                `C ${(cx - 44).toFixed(2)} 92, ${(cx - 36).toFixed(2)} 84, ${(cx - 24).toFixed(2)} 84 ` +
                `L ${(cx + 24).toFixed(2)} 84 ` +
                `C ${(cx + 36).toFixed(2)} 84, ${(cx + 44).toFixed(2)} 92, ${(cx + 46).toFixed(2)} 100 ` +
                `C ${(cx + 48).toFixed(2)} 112, ${(sbX - 3).toFixed(2)} ${(sbY - 8).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <path
              d={`M ${cx - 28} 62 L ${cx - 24} 62 M ${cx - 10} 56 L ${cx - 6} 56 M ${cx + 12} 56 L ${cx + 16} 56 M ${cx + 26} 62 L ${cx + 30} 62`}
              stroke="#94A3B8"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-70"
            />
            <path
              d={`M ${cx - 36} 74 L ${cx - 32} 74 M ${cx - 16} 70 L ${cx - 12} 70 M ${cx + 14} 70 L ${cx + 18} 70 M ${cx + 34} 74 L ${cx + 38} 74`}
              stroke="#CBD5E1"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-60"
            />
            <path
              d={`M ${cx - 20} 80 L ${cx - 16} 80 M ${cx - 4} 78 L ${cx} 78 M ${cx + 8} 78 L ${cx + 12} 78 M ${cx + 20} 80 L ${cx + 24} 80`}
              stroke="#94A3B8"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-50"
            />
          </g>
        );
      })()}

      {/* 4. Wavy / Curly */}
      {(hairId === "hair_wavy") && (() => {
        const topY = crownY - 14;
        const pWidth = crWidth + 9;
        const prX = cx + pWidth;
        const prY = cranialParams.parietalY - 4;
        const tmX = cranialParams.templeX + 8;
        const tmY = cranialParams.templeY;
        const sbX = cranialParams.earRootX - 2;
        const sbY = cranialParams.earRootY + 22;

        const lprX = cx - pWidth;
        const ltmX = cx - (tmX - cx);
        const lsbX = cx - (sbX - cx);

        const outerCap =
          `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
          `C ${(lsbX - 4).toFixed(2)} ${(sbY - 14).toFixed(2)}, ${(ltmX - 5).toFixed(2)} ${(tmY - 10).toFixed(2)}, ${(ltmX - 2).toFixed(2)} ${(tmY - 22).toFixed(2)} ` +
          `C ${(lprX - 6).toFixed(2)} ${(prY + 6).toFixed(2)}, ${(lprX - 4).toFixed(2)} ${(prY - 16).toFixed(2)}, ${(lprX + 4).toFixed(2)} ${(prY - 28).toFixed(2)} ` +
          `C ${(cx - pWidth * 0.6).toFixed(2)} ${(topY + 4).toFixed(2)}, ${(cx - 28).toFixed(2)} ${(topY - 2).toFixed(2)}, ${(cx - 12).toFixed(2)} ${topY.toFixed(2)} ` +
          `C ${(cx).toFixed(2)} ${(topY - 3).toFixed(2)}, ${(cx + 14).toFixed(2)} ${(topY - 2).toFixed(2)}, ${(cx + 28).toFixed(2)} ${(topY + 1).toFixed(2)} ` +
          `C ${(cx + pWidth * 0.6).toFixed(2)} ${(topY + 5).toFixed(2)}, ${(prX + 4).toFixed(2)} ${(prY - 28).toFixed(2)}, ${(prX + 4).toFixed(2)} ${(prY - 16).toFixed(2)} ` +
          `C ${(prX + 6).toFixed(2)} ${(prY + 6).toFixed(2)}, ${(tmX + 2).toFixed(2)} ${(tmY - 22).toFixed(2)}, ${(tmX + 5).toFixed(2)} ${(tmY - 10).toFixed(2)} ` +
          `C ${(sbX + 4).toFixed(2)} ${(sbY - 14).toFixed(2)}, ${(sbX + 2).toFixed(2)} ${(sbY - 6).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`;

        const frontHairline =
          `C ${(sbX - 5).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${(cx + 54).toFixed(2)} 120, ${(cx + 46).toFixed(2)} 106 ` +
          `C ${(cx + 40).toFixed(2)} 98, ${(cx + 32).toFixed(2)} 102, ${(cx + 22).toFixed(2)} 94 ` +
          `C ${(cx + 12).toFixed(2)} 102, ${(cx + 2).toFixed(2)} 96, ${(cx - 8).toFixed(2)} 100 ` +
          `C ${(cx - 18).toFixed(2)} 94, ${(cx - 28).toFixed(2)} 102, ${(cx - 38).toFixed(2)} 98 ` +
          `C ${(cx - 46).toFixed(2)} 106, ${(lsbX + 5).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${lsbX.toFixed(2)} ${sbY.toFixed(2)} Z`;

        return (
          <g id="forensic-hair-wavy">
            <path
              d={`${outerCap} ${frontHairline}`}
              fill="rgba(16, 19, 29, 0.68)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={
                `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(lsbX + 5).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${(cx - 46).toFixed(2)} 106, ${(cx - 38).toFixed(2)} 98 ` +
                `C ${(cx - 28).toFixed(2)} 102, ${(cx - 18).toFixed(2)} 94, ${(cx - 8).toFixed(2)} 100 ` +
                `C ${(cx + 2).toFixed(2)} 96, ${(cx + 12).toFixed(2)} 102, ${(cx + 22).toFixed(2)} 94 ` +
                `C ${(cx + 32).toFixed(2)} 102, ${(cx + 40).toFixed(2)} 98, ${(cx + 46).toFixed(2)} 106 ` +
                `C ${(cx + 54).toFixed(2)} 120, ${(sbX - 5).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${(cx - 26).toFixed(2)} ${(topY + 8).toFixed(2)} C ${(cx - 16).toFixed(2)} 52, ${(cx - 32).toFixed(2)} 66, ${(cx - 22).toFixed(2)} 84`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${(cx + 2).toFixed(2)} ${(topY + 6).toFixed(2)} C ${(cx + 14).toFixed(2)} 50, ${(cx - 2).toFixed(2)} 68, ${(cx + 10).toFixed(2)} 86`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-80"
            />
            <path
              d={`M ${(cx + 26).toFixed(2)} ${(topY + 8).toFixed(2)} C ${(cx + 38).toFixed(2)} 52, ${(cx + 22).toFixed(2)} 68, ${(cx + 34).toFixed(2)} 86`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${(lprX + 8).toFixed(2)} 68 C ${(ltmX - 2).toFixed(2)} 82, ${(ltmX + 6).toFixed(2)} 98, ${(lsbX + 4).toFixed(2)} 118`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-70"
            />
            <path
              d={`M ${(prX - 8).toFixed(2)} 68 C ${(tmX + 2).toFixed(2)} 82, ${(tmX - 6).toFixed(2)} 98, ${(sbX - 4).toFixed(2)} 118`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-70"
            />
          </g>
        );
      })()}

      {/* 5. Fade / Undercut */}
      {(hairId === "hair_fade") && (() => {
        const topY = crownY - 13;
        const pWidth = crWidth + 4;
        const prX = cx + pWidth;
        const prY = cranialParams.parietalY - 4;
        const tmX = cranialParams.templeX;
        const tmY = cranialParams.templeY;
        const sbX = cranialParams.earRootX - 4;
        const sbY = cranialParams.earRootY + 16;

        const lprX = cx - pWidth;
        const ltmX = cx - (tmX - cx);
        const lsbX = cx - (sbX - cx);

        const topCap =
          `M ${(ltmX + 2).toFixed(2)} ${(tmY - 16).toFixed(2)} ` +
          `C ${(lprX - 2).toFixed(2)} ${(prY + 8).toFixed(2)}, ${(lprX).toFixed(2)} ${(prY - 14).toFixed(2)}, ${(lprX + 6).toFixed(2)} ${(prY - 26).toFixed(2)} ` +
          `C ${(cx - pWidth * 0.5).toFixed(2)} ${(topY - 1).toFixed(2)}, ${(cx - 16).toFixed(2)} ${topY.toFixed(2)}, ${cx} ${topY.toFixed(2)} ` +
          `C ${(cx + 16).toFixed(2)} ${topY.toFixed(2)}, ${(cx + pWidth * 0.5).toFixed(2)} ${(topY - 1).toFixed(2)}, ${(prX - 6).toFixed(2)} ${(prY - 26).toFixed(2)} ` +
          `C ${(prX).toFixed(2)} ${(prY - 14).toFixed(2)}, ${(prX + 2).toFixed(2)} ${(prY + 8).toFixed(2)}, ${(tmX - 2).toFixed(2)} ${(tmY - 16).toFixed(2)} ` +
          `C ${(cx + 42).toFixed(2)} 92, ${(cx + 34).toFixed(2)} 88, ${(cx + 20).toFixed(2)} 88 ` +
          `C ${(cx + 8).toFixed(2)} 88, ${(cx - 8).toFixed(2)} 88, ${(cx - 20).toFixed(2)} 88 ` +
          `C ${(cx - 34).toFixed(2)} 88, ${(cx - 42).toFixed(2)} 92, ${(ltmX + 2).toFixed(2)} ${(tmY - 16).toFixed(2)} Z`;

        return (
          <g id="forensic-hair-fade">
            <path
              d={
                `M ${(ltmX + 2).toFixed(2)} ${(tmY - 16).toFixed(2)} ` +
                `C ${(ltmX - 2).toFixed(2)} ${(tmY - 2).toFixed(2)}, ${lsbX.toFixed(2)} ${(sbY - 8).toFixed(2)}, ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `L ${(lsbX + 8).toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(lsbX + 8).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${(ltmX + 4).toFixed(2)} ${(tmY - 4).toFixed(2)}, ${(ltmX + 6).toFixed(2)} ${(tmY - 14).toFixed(2)} Z`
              }
              fill="#334155"
              className="opacity-30"
            />
            <path
              d={
                `M ${(tmX - 2).toFixed(2)} ${(tmY - 16).toFixed(2)} ` +
                `C ${(tmX + 2).toFixed(2)} ${(tmY - 2).toFixed(2)}, ${sbX.toFixed(2)} ${(sbY - 8).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `L ${(sbX - 8).toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(sbX - 8).toFixed(2)} ${(sbY - 10).toFixed(2)}, ${(tmX - 4).toFixed(2)} ${(tmY - 4).toFixed(2)}, ${(tmX - 6).toFixed(2)} ${(tmY - 14).toFixed(2)} Z`
              }
              fill="#334155"
              className="opacity-30"
            />
            <path
              d={topCap}
              fill="rgba(16, 19, 29, 0.70)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M ${(ltmX + 2).toFixed(2)} ${(tmY - 16).toFixed(2)} C ${(cx - 42).toFixed(2)} 92, ${(cx - 34).toFixed(2)} 88, ${(cx - 20).toFixed(2)} 88 L ${(cx + 20).toFixed(2)} 88 C ${(cx + 34).toFixed(2)} 88, ${(cx + 42).toFixed(2)} 92, ${(tmX - 2).toFixed(2)} ${(tmY - 16).toFixed(2)}`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx - 24} 66 L ${cx - 20} 54 L ${cx - 16} 66 M ${cx - 8} 64 L ${cx - 4} 50 L ${cx} 64 M ${cx + 8} 64 L ${cx + 12} 52 L ${cx + 16} 64 M ${cx + 22} 66 L ${cx + 26} 56 L ${cx + 30} 66`}
              stroke="#CBD5E1"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            <line x1={lsbX + 2} y1={sbY - 6} x2={lsbX + 6} y2={sbY - 16} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1.5 2" className="opacity-60" />
            <line x1={sbX - 2} y1={sbY - 6} x2={sbX - 6} y2={sbY - 16} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1.5 2" className="opacity-60" />
          </g>
        );
      })()}

      {/* 6. Medium Flow */}
      {(hairId === "hair_medium") && (() => {
        const topY = crownY - 10;
        const pWidth = crWidth + 8;
        const prX = cx + pWidth;
        const prY = cranialParams.parietalY - 2;
        const tmX = cranialParams.templeX + 10;
        const tmY = cranialParams.templeY;
        const earX = cranialParams.earRootX + 8;
        const earY = cranialParams.earRootY + 34;

        const lprX = cx - pWidth;
        const ltmX = cx - (tmX - cx);
        const learX = cx - (earX - cx);

        const outerCap =
          `M ${learX.toFixed(2)} ${earY.toFixed(2)} ` +
          `C ${(learX - 4).toFixed(2)} ${(earY - 16).toFixed(2)}, ${(ltmX - 6).toFixed(2)} ${(tmY - 12).toFixed(2)}, ${(ltmX - 3).toFixed(2)} ${(tmY - 26).toFixed(2)} ` +
          `C ${(lprX - 4).toFixed(2)} ${(prY + 8).toFixed(2)}, ${(lprX - 2).toFixed(2)} ${(prY - 14).toFixed(2)}, ${(lprX + 6).toFixed(2)} ${(prY - 26).toFixed(2)} ` +
          `C ${(cx - pWidth * 0.5).toFixed(2)} ${(topY - 1).toFixed(2)}, ${(cx - 16).toFixed(2)} ${topY.toFixed(2)}, ${cx} ${topY.toFixed(2)} ` +
          `C ${(cx + 16).toFixed(2)} ${topY.toFixed(2)}, ${(cx + pWidth * 0.5).toFixed(2)} ${(topY - 1).toFixed(2)}, ${(prX - 6).toFixed(2)} ${(prY - 26).toFixed(2)} ` +
          `C ${(prX + 2).toFixed(2)} ${(prY - 14).toFixed(2)}, ${(prX + 4).toFixed(2)} ${(prY + 8).toFixed(2)}, ${(tmX + 3).toFixed(2)} ${(tmY - 26).toFixed(2)} ` +
          `C ${(tmX + 6).toFixed(2)} ${(tmY - 12).toFixed(2)}, ${(earX + 4).toFixed(2)} ${(earY - 16).toFixed(2)}, ${earX.toFixed(2)} ${earY.toFixed(2)}`;

        const frontHairline =
          `C ${(earX - 8).toFixed(2)} ${(earY - 12).toFixed(2)}, ${(cx + 56).toFixed(2)} 132, ${(cx + 46).toFixed(2)} 118 ` +
          `C ${(cx + 36).toFixed(2)} 106, ${(cx + 18).toFixed(2)} 102, ${(cx + 4).toFixed(2)} 98 ` +
          `C ${(cx - 4).toFixed(2)} 98, ${(cx - 18).toFixed(2)} 102, ${(cx - 36).toFixed(2)} 106 ` +
          `C ${(cx - 46).toFixed(2)} 118, ${(learX + 8).toFixed(2)} ${(earY - 12).toFixed(2)}, ${learX.toFixed(2)} ${earY.toFixed(2)} Z`;

        return (
          <g id="forensic-hair-medium">
            <path
              d={`${outerCap} ${frontHairline}`}
              fill="rgba(16, 19, 29, 0.68)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={
                `M ${learX.toFixed(2)} ${earY.toFixed(2)} ` +
                `C ${(learX + 8).toFixed(2)} ${(earY - 12).toFixed(2)}, ${(cx - 46).toFixed(2)} 118, ${(cx - 36).toFixed(2)} 106 ` +
                `C ${(cx - 18).toFixed(2)} 102, ${(cx - 4).toFixed(2)} 98, ${(cx + 4).toFixed(2)} 98 ` +
                `C ${(cx + 18).toFixed(2)} 102, ${(cx + 36).toFixed(2)} 106, ${(cx + 46).toFixed(2)} 118 ` +
                `C ${(cx + 56).toFixed(2)} 132, ${(earX - 8).toFixed(2)} ${(earY - 12).toFixed(2)}, ${earX.toFixed(2)} ${earY.toFixed(2)}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx - 2} 98 C ${cx - 16} 108, ${cx - 34} 122, ${cx - 48} 136`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 2} 98 C ${cx + 16} 108, ${cx + 34} 122, ${cx + 48} 136`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d={`M ${(lprX + 6).toFixed(2)} 72 C ${(ltmX).toFixed(2)} 96, ${(learX + 2).toFixed(2)} 124, ${(learX - 2).toFixed(2)} ${(earY - 4).toFixed(2)}`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-70"
            />
            <path
              d={`M ${(prX - 6).toFixed(2)} 72 C ${(tmX).toFixed(2)} 96, ${(earX - 2).toFixed(2)} 124, ${(earX + 2).toFixed(2)} ${(earY - 4).toFixed(2)}`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-70"
            />
          </g>
        );
      })()}

      {/* 7. Long Cascading */}
      {(hairId === "hair_long" || hairId === "other_hair_long") && (() => {
        const topY = crownY - 11;
        const outerPrW = crWidth + 12;
        const prX = cx + outerPrW;
        const prY = cranialParams.parietalY - 2;
        const tmX = cranialParams.templeX + 16;
        const earX = cranialParams.earRootX + 16;
        const jawX = cranialParams.gonialX + 18;
        const shoulderX = cranialParams.neckShoulderX + 14;

        const lprX = cx - outerPrW;
        const ltmX = cx - (tmX - cx);
        const learX = cx - (earX - cx);
        const ljawX = cx - (jawX - cx);
        const lshoulderX = cx - (shoulderX - cx);

        const chestY = 352;
        const innerDropY = 354;

        const outerLongFlow =
          `M ${lshoulderX.toFixed(2)} ${chestY} ` +
          `C ${(lshoulderX - 4).toFixed(2)} 310, ${(ljawX - 4).toFixed(2)} 250, ${(ljawX - 2).toFixed(2)} 220 ` +
          `C ${(learX - 2).toFixed(2)} 180, ${(ltmX - 2).toFixed(2)} 140, ${(lprX - 1).toFixed(2)} ${(prY + 10).toFixed(2)} ` +
          `C ${(lprX - 2).toFixed(2)} ${(prY - 16).toFixed(2)}, ${(cx - outerPrW * 0.55).toFixed(2)} ${(topY + 1).toFixed(2)}, ${cx} ${topY.toFixed(2)} ` +
          `C ${(cx + outerPrW * 0.55).toFixed(2)} ${(topY + 1).toFixed(2)}, ${(prX + 2).toFixed(2)} ${(prY - 16).toFixed(2)}, ${(prX + 1).toFixed(2)} ${(prY + 10).toFixed(2)} ` +
          `C ${(tmX + 2).toFixed(2)} 140, ${(earX + 2).toFixed(2)} 180, ${(jawX + 2).toFixed(2)} 220 ` +
          `C ${(jawX + 4).toFixed(2)} 250, ${(shoulderX + 4).toFixed(2)} 310, ${shoulderX.toFixed(2)} ${chestY}`;

        const rightTip =
          `C ${(shoulderX - 6).toFixed(2)} ${(chestY + 4)}, ${(shoulderX - 18).toFixed(2)} ${(chestY + 4)}, ${(shoulderX - 24).toFixed(2)} ${innerDropY} ` +
          `C ${(shoulderX - 28).toFixed(2)} 305, ${(jawX - 14).toFixed(2)} 255, ${(cranialParams.gonialX - 6).toFixed(2)} 235 ` +
          `C ${(cranialParams.cheekX - 4).toFixed(2)} 195, ${(cx + 62).toFixed(2)} 155, ${(cx + 56).toFixed(2)} 128 ` +
          `C ${(cx + 50).toFixed(2)} 106, ${(cx + 34).toFixed(2)} 92, ${(cx - 3).toFixed(2)} 84`;

        const leftTip =
          `C ${(cx - 34).toFixed(2)} 92, ${(cx - 50).toFixed(2)} 106, ${(cx - 56).toFixed(2)} 128 ` +
          `C ${(cx - 62).toFixed(2)} 155, ${(cx - (cranialParams.cheekX - cx) + 4).toFixed(2)} 195, ${(cx - (cranialParams.gonialX - cx) + 6).toFixed(2)} 235 ` +
          `C ${(ljawX + 14).toFixed(2)} 255, ${(lshoulderX + 28).toFixed(2)} 305, ${(lshoulderX + 24).toFixed(2)} ${innerDropY} ` +
          `C ${(lshoulderX + 18).toFixed(2)} ${(chestY + 4)}, ${(lshoulderX + 6).toFixed(2)} ${(chestY + 4)}, ${lshoulderX.toFixed(2)} ${chestY} Z`;

        return (
          <g id="forensic-hair-long">
            <path
              d={`${outerLongFlow} ${rightTip} ${leftTip}`}
              fill="rgba(16, 19, 29, 0.65)"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={
                `M ${(cx - 3).toFixed(2)} 84 ` +
                `C ${(cx + 34).toFixed(2)} 92, ${(cx + 50).toFixed(2)} 106, ${(cx + 56).toFixed(2)} 128 ` +
                `C ${(cx + 62).toFixed(2)} 155, ${(cranialParams.cheekX - 4).toFixed(2)} 195, ${(cranialParams.gonialX - 6).toFixed(2)} 235 ` +
                `C ${(jawX - 14).toFixed(2)} 255, ${(shoulderX - 28).toFixed(2)} 305, ${(shoulderX - 24).toFixed(2)} ${innerDropY}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d={
                `M ${(cx - 3).toFixed(2)} 84 ` +
                `C ${(cx - 34).toFixed(2)} 92, ${(cx - 50).toFixed(2)} 106, ${(cx - 56).toFixed(2)} 128 ` +
                `C ${(cx - 62).toFixed(2)} 155, ${(cx - (cranialParams.cheekX - cx) + 4).toFixed(2)} 195, ${(cx - (cranialParams.gonialX - cx) + 6).toFixed(2)} 235 ` +
                `C ${(ljawX + 14).toFixed(2)} 255, ${(lshoulderX + 28).toFixed(2)} 305, ${(lshoulderX + 24).toFixed(2)} ${innerDropY}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d={`M ${(cx - 2).toFixed(2)} ${(topY + 1).toFixed(2)} C ${(cx - 3).toFixed(2)} ${(topY + 22).toFixed(2)}, ${(cx - 4).toFixed(2)} 65, ${(cx - 3).toFixed(2)} 84`}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <path
              d={`M ${(cx + 28).toFixed(2)} ${(topY + 4).toFixed(2)} C ${(prX - 8).toFixed(2)} 65, ${(earX - 2).toFixed(2)} 150, ${(jawX - 4).toFixed(2)} 240 C ${(jawX - 4).toFixed(2)} 275, ${(shoulderX - 12).toFixed(2)} 315, ${(shoulderX - 14).toFixed(2)} 348`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-80"
            />
            <path
              d={`M ${(cx + 42).toFixed(2)} ${(topY + 12).toFixed(2)} C ${(prX + 4).toFixed(2)} 90, ${(earX + 6).toFixed(2)} 170, ${(jawX + 6).toFixed(2)} 255 C ${(jawX + 6).toFixed(2)} 285, ${(shoulderX - 4).toFixed(2)} 320, ${(shoulderX - 8).toFixed(2)} 349`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-60"
            />
            <path
              d={`M ${(cx - 28).toFixed(2)} ${(topY + 4).toFixed(2)} C ${(lprX + 8).toFixed(2)} 65, ${(learX + 2).toFixed(2)} 150, ${(ljawX + 4).toFixed(2)} 240 C ${(ljawX + 4).toFixed(2)} 275, ${(lshoulderX + 12).toFixed(2)} 315, ${(lshoulderX + 14).toFixed(2)} 348`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-80"
            />
            <path
              d={`M ${(cx - 42).toFixed(2)} ${(topY + 12).toFixed(2)} C ${(lprX - 4).toFixed(2)} 90, ${(learX - 6).toFixed(2)} 170, ${(ljawX - 6).toFixed(2)} 255 C ${(ljawX - 6).toFixed(2)} 285, ${(lshoulderX + 4).toFixed(2)} 320, ${(lshoulderX + 8).toFixed(2)} 349`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-60"
            />
          </g>
        );
      })()}

      {/* 8. Afro Texture */}
      {(hairId === "hair_afro") && (() => {
        const topY = crownY - 18;
        const pWidth = crWidth + 16;
        const prX = cx + pWidth;
        const prY = cranialParams.parietalY - 6;
        const tmX = cranialParams.templeX + 14;
        const sbX = cranialParams.earRootX + 6;
        const sbY = cranialParams.earRootY + 20;

        const lprX = cx - pWidth;
        const ltmX = cx - (tmX - cx);
        const lsbX = cx - (sbX - cx);

        const outerHalo =
          `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
          `C ${(lsbX - 8).toFixed(2)} ${(sbY - 16).toFixed(2)}, ${(ltmX - 10).toFixed(2)} ${(tmX - 12)}, ${(lprX - 8).toFixed(2)} ${(prY + 8).toFixed(2)} ` +
          `C ${(lprX - 10).toFixed(2)} ${(prY - 16).toFixed(2)}, ${(cx - pWidth * 0.75).toFixed(2)} ${(topY + 6).toFixed(2)}, ${(cx - 36).toFixed(2)} ${topY.toFixed(2)} ` +
          `C ${(cx - 18).toFixed(2)} ${(topY - 3).toFixed(2)}, ${(cx + 18).toFixed(2)} ${(topY - 3).toFixed(2)}, ${(cx + 36).toFixed(2)} ${topY.toFixed(2)} ` +
          `C ${(cx + pWidth * 0.75).toFixed(2)} ${(topY + 6).toFixed(2)}, ${(prX + 10).toFixed(2)} ${(prY - 16).toFixed(2)}, ${(prX + 8).toFixed(2)} ${(prY + 8).toFixed(2)} ` +
          `C ${(tmX + 10).toFixed(2)} ${(tmX - 12)}, ${(sbX + 8).toFixed(2)} ${(sbY - 16).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`;

        const frontHairline =
          `C ${(sbX - 8).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${(cx + 56).toFixed(2)} 116, ${(cx + 46).toFixed(2)} 102 ` +
          `C ${(cx + 36).toFixed(2)} 92, ${(cx + 18).toFixed(2)} 88, ${cx} 88 ` +
          `C ${(cx - 18).toFixed(2)} 88, ${(cx - 36).toFixed(2)} 92, ${(cx - 46).toFixed(2)} 102 ` +
          `C ${(cx - 56).toFixed(2)} 116, ${(lsbX + 8).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${lsbX.toFixed(2)} ${sbY.toFixed(2)} Z`;

        return (
          <g id="forensic-hair-afro">
            <path
              d={`${outerHalo} ${frontHairline}`}
              fill="rgba(16, 19, 29, 0.72)"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={
                `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(lsbX + 8).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${(cx - 56).toFixed(2)} 116, ${(cx - 46).toFixed(2)} 102 ` +
                `C ${(cx - 36).toFixed(2)} 92, ${(cx - 18).toFixed(2)} 88, ${cx} 88 ` +
                `C ${(cx + 18).toFixed(2)} 88, ${(cx + 36).toFixed(2)} 92, ${(cx + 46).toFixed(2)} 102 ` +
                `C ${(cx + 56).toFixed(2)} 116, ${(sbX - 8).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx={cx - 32} cy={topY + 16} r="3.5" stroke="#CBD5E1" strokeWidth="1.1" fill="none" className="opacity-70" />
            <circle cx={cx} cy={topY + 12} r="4.0" stroke="#CBD5E1" strokeWidth="1.1" fill="none" className="opacity-75" />
            <circle cx={cx + 32} cy={topY + 16} r="3.5" stroke="#CBD5E1" strokeWidth="1.1" fill="none" className="opacity-70" />
            <circle cx={cx - 48} cy={topY + 34} r="3.5" stroke="#94A3B8" strokeWidth="1.0" fill="none" className="opacity-60" />
            <circle cx={cx - 18} cy={topY + 28} r="3.5" stroke="#CBD5E1" strokeWidth="1.1" fill="none" className="opacity-70" />
            <circle cx={cx + 18} cy={topY + 28} r="3.5" stroke="#CBD5E1" strokeWidth="1.1" fill="none" className="opacity-70" />
            <circle cx={cx + 48} cy={topY + 34} r="3.5" stroke="#94A3B8" strokeWidth="1.0" fill="none" className="opacity-60" />
            <circle cx={cx - 36} cy={82} r="3.0" stroke="#CBD5E1" strokeWidth="1.0" fill="none" className="opacity-65" />
            <circle cx={cx} cy={76} r="3.5" stroke="#E2E8F0" strokeWidth="1.1" fill="none" className="opacity-80" />
            <circle cx={cx + 36} cy={82} r="3.0" stroke="#CBD5E1" strokeWidth="1.0" fill="none" className="opacity-65" />
          </g>
        );
      })()}

      {/* 9. Slicked Back */}
      {(hairId === "hair_slicked") && (() => {
        const topY = crownY - 16;
        const pWidth = crWidth + 4;
        const prX = cx + pWidth;
        const prY = cranialParams.parietalY - 4;
        const tmX = cranialParams.templeX + 2;
        const tmY = cranialParams.templeY;
        const sbX = cranialParams.earRootX - 4;
        const sbY = cranialParams.earRootY + 18;

        const lprX = cx - pWidth;
        const ltmX = cx - (tmX - cx);
        const lsbX = cx - (sbX - cx);

        const outerCap =
          `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
          `C ${(lsbX - 2).toFixed(2)} ${(sbY - 16).toFixed(2)}, ${(ltmX - 1).toFixed(2)} ${(tmY - 16).toFixed(2)}, ${(ltmX).toFixed(2)} ${(tmY - 26).toFixed(2)} ` +
          `C ${(lprX - 2).toFixed(2)} ${(prY + 8).toFixed(2)}, ${(lprX - 1).toFixed(2)} ${(prY - 16).toFixed(2)}, ${(lprX + 6).toFixed(2)} ${(prY - 30).toFixed(2)} ` +
          `C ${(cx - pWidth * 0.45).toFixed(2)} ${(topY - 2).toFixed(2)}, ${(cx - 16).toFixed(2)} ${topY.toFixed(2)}, ${cx} ${topY.toFixed(2)} ` +
          `C ${(cx + 16).toFixed(2)} ${topY.toFixed(2)}, ${(cx + pWidth * 0.45).toFixed(2)} ${(topY - 2).toFixed(2)}, ${(prX - 6).toFixed(2)} ${(prY - 30).toFixed(2)} ` +
          `C ${(prX + 1).toFixed(2)} ${(prY - 16).toFixed(2)}, ${(prX + 2).toFixed(2)} ${(prY + 8).toFixed(2)}, ${(tmX).toFixed(2)} ${(tmY - 26).toFixed(2)} ` +
          `C ${(tmX + 1).toFixed(2)} ${(tmY - 16).toFixed(2)}, ${(sbX + 2).toFixed(2)} ${(sbY - 16).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`;

        const frontHairline =
          `C ${(sbX - 5).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${(cx + 52).toFixed(2)} 116, ${(cx + 46).toFixed(2)} 100 ` +
          `C ${(cx + 40).toFixed(2)} 88, ${(cx + 24).toFixed(2)} 82, ${cx} 82 ` +
          `C ${(cx - 24).toFixed(2)} 82, ${(cx - 40).toFixed(2)} 88, ${(cx - 46).toFixed(2)} 100 ` +
          `C ${(cx - 52).toFixed(2)} 116, ${(lsbX + 5).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${lsbX.toFixed(2)} ${sbY.toFixed(2)} Z`;

        return (
          <g id="forensic-hair-slicked">
            <path
              d={`${outerCap} ${frontHairline}`}
              fill="rgba(16, 19, 29, 0.68)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={
                `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(lsbX + 5).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${(cx - 52).toFixed(2)} 116, ${(cx - 46).toFixed(2)} 100 ` +
                `C ${(cx - 40).toFixed(2)} 88, ${(cx - 24).toFixed(2)} 82, ${cx} 82 ` +
                `C ${(cx - 24).toFixed(2)} 82, ${(cx - 40).toFixed(2)} 88, ${(cx - 46).toFixed(2)} 100 ` +
                `C ${(cx + 52).toFixed(2)} 116, ${(sbX - 5).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx - 24} 84 C ${cx - 22} 62, ${cx - 20} 42, ${cx - 16} ${(topY + 3).toFixed(2)}`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx - 10} 82 C ${cx - 8} 58, ${cx - 6} 38, ${cx - 4} ${(topY + 1).toFixed(2)}`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 10} 82 C ${cx + 8} 58, ${cx + 6} 38, ${cx + 4} ${(topY + 1).toFixed(2)}`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 24} 84 C ${cx + 22} 62, ${cx + 20} 42, ${cx + 16} ${(topY + 3).toFixed(2)}`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d={`M ${(cx - 38).toFixed(2)} 92 C ${(cx - 44).toFixed(2)} 104, ${(lsbX + 4).toFixed(2)} 118, ${lsbX.toFixed(2)} ${(sbY - 4).toFixed(2)}`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-60"
            />
            <path
              d={`M ${(cx + 38).toFixed(2)} 92 C ${(cx + 44).toFixed(2)} 104, ${(sbX - 4).toFixed(2)} 118, ${sbX.toFixed(2)} ${(sbY - 4).toFixed(2)}`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-60"
            />
          </g>
        );
      })()}

      {/* 10. Receded / Bald */}
      {(hairId === "hair_bald") && (() => {
        const topY = crownY;
        const pWidth = crWidth;
        const prX = cx + pWidth;
        const prY = cranialParams.parietalY;
        const tmX = cranialParams.templeX;
        const tmY = cranialParams.templeY;
        const sbX = cranialParams.earRootX - 4;
        const sbY = cranialParams.earRootY + 16;

        const lprX = cx - pWidth;
        const ltmX = cx - (tmX - cx);
        const lsbX = cx - (sbX - cx);

        return (
          <g id="forensic-hair-bald">
            <path
              d={`M ${(cx - 38).toFixed(2)} ${(topY + 14).toFixed(2)} C ${(cx - 18).toFixed(2)} ${(topY + 4).toFixed(2)}, ${(cx + 18).toFixed(2)} ${(topY + 4).toFixed(2)}, ${(cx + 38).toFixed(2)} ${(topY + 14).toFixed(2)}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-75"
            />
            <path
              d={
                `M ${lsbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(lsbX - 1).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${(ltmX - 1).toFixed(2)} ${(tmY - 8).toFixed(2)}, ${(ltmX).toFixed(2)} ${(tmY - 18).toFixed(2)} ` +
                `C ${(lprX + 4).toFixed(2)} ${(prY + 6).toFixed(2)}, ${(cx - 48).toFixed(2)} 116, ${(cx - 42).toFixed(2)} 110 ` +
                `C ${(cx - 46).toFixed(2)} 122, ${(lsbX + 4).toFixed(2)} ${(sbY - 6).toFixed(2)}, ${lsbX.toFixed(2)} ${sbY.toFixed(2)} Z`
              }
              fill="#334155"
              className="opacity-35"
            />
            <path
              d={
                `M ${sbX.toFixed(2)} ${sbY.toFixed(2)} ` +
                `C ${(sbX + 1).toFixed(2)} ${(sbY - 12).toFixed(2)}, ${(tmX + 1).toFixed(2)} ${(tmY - 8).toFixed(2)}, ${(tmX).toFixed(2)} ${(tmY - 18).toFixed(2)} ` +
                `C ${(prX - 4).toFixed(2)} ${(prY + 6).toFixed(2)}, ${(cx + 48).toFixed(2)} 116, ${(cx + 42).toFixed(2)} 110 ` +
                `C ${(cx + 46).toFixed(2)} 122, ${(sbX - 4).toFixed(2)} ${(sbY - 6).toFixed(2)}, ${sbX.toFixed(2)} ${sbY.toFixed(2)} Z`
              }
              fill="#334155"
              className="opacity-35"
            />
            <path
              d={`M ${(lsbX + 2).toFixed(2)} ${(sbY - 8).toFixed(2)} L ${(lsbX + 6).toFixed(2)} ${(sbY - 8).toFixed(2)} M ${(lsbX + 4).toFixed(2)} ${(sbY - 16).toFixed(2)} L ${(lsbX + 8).toFixed(2)} ${(sbY - 16).toFixed(2)}`}
              stroke="#94A3B8"
              strokeWidth="0.8"
              strokeLinecap="round"
              className="opacity-60"
            />
            <path
              d={`M ${(sbX - 2).toFixed(2)} ${(sbY - 8).toFixed(2)} L ${(sbX - 6).toFixed(2)} ${(sbY - 8).toFixed(2)} M ${(sbX - 4).toFixed(2)} ${(sbY - 16).toFixed(2)} L ${(sbX - 8).toFixed(2)} ${(sbY - 16).toFixed(2)}`}
              stroke="#94A3B8"
              strokeWidth="0.8"
              strokeLinecap="round"
              className="opacity-60"
            />
          </g>
        );
      })()}

      {/* 11. Sleek Chin Bob */}
      {(hairId === "hair_bob") && (() => {
        const topY = crownY - 8;
        const pWidth = crWidth + 8;
        return (
          <g id="forensic-hair-bob">
            {/* Outer Volumetric Bob mass curving cleanly down to chin (Y=250) */}
            <path
              d={`M ${cx - pWidth + 2} 248 C ${cx - pWidth - 8} 190, ${cx - pWidth} 130, ${cx - pWidth + 8} ${topY + 12} C ${cx - 36} ${topY - 2}, ${cx - 14} ${topY}, ${cx} ${topY} C ${cx + 14} ${topY}, ${cx + 36} ${topY - 2}, ${cx + pWidth - 8} ${topY + 12} C ${cx + pWidth} 130, ${cx + pWidth + 8} 190, ${cx + pWidth - 2} 248 C ${cx + pWidth - 14} 252, ${cx + 38} 250, ${cx + 42} 220 C ${cx + 44} 170, ${cx + 40} 120, ${cx + 10} 108 C ${cx + 4} 106, ${cx - 4} 106, ${cx - 10} 108 C ${cx - 40} 120, ${cx - 44} 170, ${cx - 42} 220 C ${cx - 38} 250, ${cx - pWidth + 14} 252, ${cx - pWidth + 2} 248 Z`}
              fill="rgba(16, 19, 29, 0.72)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center parting */}
            <line x1={cx} y1={topY} x2={cx} y2={106} stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            {/* Smooth sleek bob strand lines */}
            <path d={`M ${cx - 12} 108 C ${cx - 36} 134, ${cx - 44} 184, ${cx - 38} 242`} fill="none" stroke="#CBD5E1" strokeWidth="1.1" strokeLinecap="round" />
            <path d={`M ${cx + 12} 108 C ${cx + 36} 134, ${cx + 44} 184, ${cx + 38} 242`} fill="none" stroke="#CBD5E1" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        );
      })()}

      {/* 12. Textured Pixie Crop */}
      {(hairId === "hair_pixie") && (() => {
        const topY = crownY - 12;
        const pWidth = crWidth + 4;
        return (
          <g id="forensic-hair-pixie">
            <path
              d={`M ${cx - pWidth} 160 C ${cx - pWidth - 2} 120, ${cx - 44} ${topY + 6}, ${cx - 16} ${topY} C ${cx} ${topY - 2}, ${cx + 20} ${topY}, ${cx + pWidth - 2} ${topY + 8} C ${cx + pWidth + 4} 120, ${cx + pWidth} 160, ${cx + pWidth - 6} 165 C ${cx + 48} 128, ${cx + 36} 102, ${cx + 14} 98 C ${cx} 96, ${cx - 16} 98, ${cx - 38} 104 C ${cx - 48} 124, ${cx - pWidth + 4} 162, ${cx - pWidth} 160 Z`}
              fill="rgba(16, 19, 29, 0.68)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Feathered pixie top texture wisps */}
            <path d={`M ${cx - 18} 98 C ${cx - 10} 86, ${cx - 4} 78, ${cx + 2} 74`} fill="none" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
            <path d={`M ${cx - 6} 96 C ${cx + 4} 84, ${cx + 12} 78, ${cx + 18} 74`} fill="none" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
            <path d={`M ${cx - 32} 104 C ${cx - 24} 92, ${cx - 16} 84, ${cx - 8} 80`} fill="none" stroke="#CBD5E1" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        );
      })()}

      {/* 13. High Sleek Ponytail */}
      {(hairId === "hair_ponytail") && (() => {
        const topY = crownY - 6;
        const pWidth = crWidth + 2;
        return (
          <g id="forensic-hair-ponytail">
            {/* Sleek pulled back crown mass */}
            <path
              d={`M ${cx - pWidth} 168 C ${cx - pWidth - 2} 124, ${cx - 42} ${topY + 6}, ${cx} ${topY} C ${cx + 42} ${topY + 6}, ${cx + pWidth + 2} 124, ${cx + pWidth} 168 C ${cx + 48} 136, ${cx + 42} 108, ${cx} 94 C ${cx - 42} 108, ${cx - 48} 136, ${cx - pWidth} 168 Z`}
              fill="rgba(16, 19, 29, 0.75)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* High knot/scrunchie */}
            <ellipse cx={cx + 18} cy={topY - 14} rx="6" ry="4" fill="#0A0E17" stroke="#FFFFFF" strokeWidth="1.4" />
            {/* Cascading ponytail fountain */}
            <path
              d={`M ${cx + 16} ${topY - 16} C ${cx + 34} ${topY - 28}, ${cx + 64} ${topY - 12}, ${cx + 68} ${topY + 36} C ${cx + 72} 140, ${cx + 68} 210, ${cx + 64} 260 C ${cx + 56} 260, ${cx + 58} 200, ${cx + 56} 140 C ${cx + 52} ${topY + 12}, ${cx + 32} ${topY - 6}, ${cx + 18} ${topY - 12}`}
              fill="rgba(16, 19, 29, 0.72)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Stream lines */}
            <path d={`M ${cx + 24} ${topY - 14} C ${cx + 48} ${topY - 6}, ${cx + 62} 140, ${cx + 60} 240`} fill="none" stroke="#CBD5E1" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        );
      })()}

      {/* 14. Curtain Bangs & Layers */}
      {(hairId === "hair_curtain_bangs") && (() => {
        const topY = crownY - 8;
        const pWidth = crWidth + 10;
        return (
          <g id="forensic-hair-curtain-bangs">
            {/* Long layered hair base */}
            <path
              d={`M ${cx - pWidth} 310 C ${cx - pWidth - 4} 220, ${cx - pWidth} 130, ${cx} ${topY} C ${cx + pWidth} 130, ${cx + pWidth + 4} 220, ${cx + pWidth} 310 C ${cx + pWidth - 14} 312, ${cx + 46} 260, ${cx + 44} 190 C ${cx + 42} 130, ${cx + 28} 104, ${cx} 96 C ${cx - 28} 104, ${cx - 42} 130, ${cx - 44} 190 C ${cx - 46} 260, ${cx - pWidth + 14} 312, ${cx - pWidth} 310 Z`}
              fill="rgba(16, 19, 29, 0.7)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center parted curtain bangs sweeping over forehead */}
            <path d={`M ${cx} 94 C ${cx - 16} 102, ${cx - 34} 122, ${cx - 42} 154`} fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d={`M ${cx} 94 C ${cx + 16} 102, ${cx + 34} 122, ${cx + 42} 154`} fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d={`M ${cx - 2} 96 C ${cx - 22} 112, ${cx - 40} 138, ${cx - 48} 176`} fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
            <path d={`M ${cx + 2} 96 C ${cx + 22} 112, ${cx + 40} 138, ${cx + 48} 176`} fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );
      })()}

      {/* 15. Sleek Straight (Center Part) */}
      {(hairId === "hair_sleek_straight") && (() => {
        const topY = crownY - 6;
        const pWidth = crWidth + 8;
        return (
          <g id="forensic-hair-sleek-straight">
            <path
              d={`M ${cx - pWidth} 330 C ${cx - pWidth - 2} 220, ${cx - pWidth} 130, ${cx} ${topY} C ${cx + pWidth} 130, ${cx + pWidth + 2} 220, ${cx + pWidth} 330 C ${cx + pWidth - 14} 332, ${cx + 48} 250, ${cx + 44} 180 C ${cx + 42} 124, ${cx + 18} 104, ${cx} 102 C ${cx - 18} 104, ${cx - 42} 124, ${cx - 44} 180 C ${cx - 48} 250, ${cx - pWidth + 14} 332, ${cx - pWidth} 330 Z`}
              fill="rgba(16, 19, 29, 0.72)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center Part */}
            <line x1={cx} y1={topY} x2={cx} y2={102} stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            {/* Long sleek vertical fall lines */}
            <line x1={cx - 36} y1={128} x2={cx - 48} y2={320} stroke="#CBD5E1" strokeWidth="1.1" strokeLinecap="round" />
            <line x1={cx + 36} y1={128} x2={cx + 48} y2={320} stroke="#CBD5E1" strokeWidth="1.1" strokeLinecap="round" />
            <line x1={cx - pWidth + 10} y1={160} x2={cx - pWidth + 6} y2={320} stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" className="opacity-60" />
            <line x1={cx + pWidth - 10} y1={160} x2={cx + pWidth - 6} y2={320} stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" className="opacity-60" />
          </g>
        );
      })()}

      {/* 16. Shoulder Lob (Wavy) */}
      {(hairId === "hair_shoulder_lob") && (() => {
        const topY = crownY - 8;
        const pWidth = crWidth + 12;
        return (
          <g id="forensic-hair-shoulder-lob">
            <path
              d={`M ${cx - pWidth} 280 C ${cx - pWidth - 8} 220, ${cx - pWidth + 4} 160, ${cx - pWidth} 120 C ${cx - 42} ${topY}, ${cx} ${topY} C ${cx + 42} ${topY}, ${cx + pWidth} 120 C ${cx + pWidth - 4} 160, ${cx + pWidth + 8} 220, ${cx + pWidth} 280 C ${cx + pWidth - 16} 282, ${cx + 46} 240, ${cx + 42} 180 C ${cx + 40} 124, ${cx + 12} 104, ${cx} 102 C ${cx - 12} 104, ${cx - 40} 124, ${cx - 42} 180 C ${cx - 46} 240, ${cx - pWidth + 16} 282, ${cx - pWidth} 280 Z`}
              fill="rgba(16, 19, 29, 0.72)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Wavy S-curves along the lob length */}
            <path d={`M ${cx - 36} 120 C ${cx - 50} 160, ${cx - 32} 200, ${cx - 46} 260`} fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
            <path d={`M ${cx + 36} 120 C ${cx + 50} 160, ${cx + 32} 200, ${cx + 46} 260`} fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );
      })()}

      {/* 17. Blunt Bangs & Long */}
      {(hairId === "hair_blunt_bangs") && (() => {
        const topY = crownY - 8;
        const pWidth = crWidth + 10;
        return (
          <g id="forensic-hair-blunt-bangs">
            {/* Long outer hair mass */}
            <path
              d={`M ${cx - pWidth} 320 C ${cx - pWidth - 4} 220, ${cx - pWidth} 130, ${cx} ${topY} C ${cx + pWidth} 130, ${cx + pWidth + 4} 220, ${cx + pWidth} 320 C ${cx + pWidth - 14} 322, ${cx + 46} 250, ${cx + 44} 180 C ${cx + 42} 120, ${cx - 42} 120, ${cx - 44} 180 C ${cx - 46} 250, ${cx - pWidth + 14} 322, ${cx - pWidth} 320 Z`}
              fill="rgba(16, 19, 29, 0.72)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Solid Horizontal Blunt Bangs line across brow */}
            <path
              d={`M ${cx - 44} 120 C ${cx - 20} 121, ${cx + 20} 121, ${cx + 44} 120 L ${cx + 44} 102 C ${cx + 22} 98, ${cx - 22} 98, ${cx - 44} 102 Z`}
              fill="rgba(16, 19, 29, 0.85)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Vertical bangs hatch lines */}
            <line x1={cx - 30} y1={104} x2={cx - 30} y2={120} stroke="#94A3B8" strokeWidth="0.8" className="opacity-60" />
            <line x1={cx - 15} y1={102} x2={cx - 15} y2={121} stroke="#94A3B8" strokeWidth="0.8" className="opacity-60" />
            <line x1={cx} y1={102} x2={cx} y2={121} stroke="#FFFFFF" strokeWidth="0.9" className="opacity-70" />
            <line x1={cx + 15} y1={102} x2={cx + 15} y2={121} stroke="#94A3B8" strokeWidth="0.8" className="opacity-60" />
            <line x1={cx + 30} y1={104} x2={cx + 30} y2={120} stroke="#94A3B8" strokeWidth="0.8" className="opacity-60" />
          </g>
        );
      })()}

      {/* 18. Afro Puffs / Space Buns */}
      {(hairId === "hair_afro_puffs") && (() => {
        const topY = crownY - 4;
        return (
          <g id="forensic-hair-afro-puffs">
            {/* Sleek Scalp Base */}
            <path
              d={`M ${cx - crWidth} 160 C ${cx - crWidth - 2} 120, ${cx - 36} ${topY}, ${cx} ${topY} C ${cx + 36} ${topY}, ${cx + crWidth + 2} 120, ${cx + crWidth} 160 C ${cx + 46} 130, ${cx + 40} 108, ${cx} 96 C ${cx - 40} 108, ${cx - 46} 130, ${cx - crWidth} 160 Z`}
              fill="rgba(16, 19, 29, 0.75)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Left Afro Puff sphere */}
            <circle cx={cx - 52} cy={topY - 14} r="26" fill="rgba(16, 19, 29, 0.85)" stroke="#FFFFFF" strokeWidth="1.6" strokeDasharray="3 1.5" />
            {/* Right Afro Puff sphere */}
            <circle cx={cx + 52} cy={topY - 14} r="26" fill="rgba(16, 19, 29, 0.85)" stroke="#FFFFFF" strokeWidth="1.6" strokeDasharray="3 1.5" />
            {/* Texture coils inside puffs */}
            <circle cx={cx - 52} cy={topY - 14} r="18" fill="none" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" className="opacity-70" />
            <circle cx={cx + 52} cy={topY - 14} r="18" fill="none" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" className="opacity-70" />
          </g>
        );
      })()}

      {/* 19. Box Braids / Cornrows */}
      {(hairId === "hair_box_braids") && (() => {
        const topY = crownY - 6;
        const pWidth = crWidth + 6;
        return (
          <g id="forensic-hair-box-braids">
            <path
              d={`M ${cx - pWidth} 320 C ${cx - pWidth - 2} 220, ${cx - pWidth} 130, ${cx} ${topY} C ${cx + pWidth} 130, ${cx + pWidth + 2} 220, ${cx + pWidth} 320 C ${cx + pWidth - 12} 322, ${cx + 48} 250, ${cx + 44} 180 C ${cx + 42} 124, ${cx + 18} 104, ${cx} 98 C ${cx - 18} 104, ${cx - 42} 124, ${cx - 44} 180 C ${cx - 48} 250, ${cx - pWidth + 12} 322, ${cx - pWidth} 320 Z`}
              fill="rgba(16, 19, 29, 0.72)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Intricate cornrow & braid tracks */}
            <line x1={cx - 42} y1={120} x2={cx - 52} y2={310} stroke="#FFFFFF" strokeWidth="1.3" strokeDasharray="4 2" />
            <line x1={cx - 26} y1={108} x2={cx - 38} y2={310} stroke="#FFFFFF" strokeWidth="1.3" strokeDasharray="4 2" />
            <line x1={cx - 10} y1={100} x2={cx - 24} y2={310} stroke="#FFFFFF" strokeWidth="1.3" strokeDasharray="4 2" />
            <line x1={cx + 10} y1={100} x2={cx + 24} y2={310} stroke="#FFFFFF" strokeWidth="1.3" strokeDasharray="4 2" />
            <line x1={cx + 26} y1={108} x2={cx + 38} y2={310} stroke="#FFFFFF" strokeWidth="1.3" strokeDasharray="4 2" />
            <line x1={cx + 42} y1={120} x2={cx + 52} y2={310} stroke="#FFFFFF" strokeWidth="1.3" strokeDasharray="4 2" />
          </g>
        );
      })()}

      {/* 20. Textured Dreadlocks */}
      {(hairId === "hair_dreadlocks") && (() => {
        const topY = crownY - 10;
        const pWidth = crWidth + 10;
        return (
          <g id="forensic-hair-dreadlocks">
            <path
              d={`M ${cx - pWidth} 320 C ${cx - pWidth - 4} 220, ${cx - pWidth} 130, ${cx} ${topY} C ${cx + pWidth} 130, ${cx + pWidth + 4} 220, ${cx + pWidth} 320 C ${cx + pWidth - 14} 322, ${cx + 46} 250, ${cx + 44} 180 C ${cx + 42} 124, ${cx + 18} 104, ${cx} 98 C ${cx - 18} 104, ${cx - 42} 124, ${cx - 44} 180 C ${cx - 46} 250, ${cx - pWidth + 14} 322, ${cx - pWidth} 320 Z`}
              fill="rgba(16, 19, 29, 0.72)"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Thick cylindrical dreadlock ropes */}
            <path d={`M ${cx - 46} 124 C ${cx - 56} 190, ${cx - 52} 260, ${cx - 56} 315`} fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 2" />
            <path d={`M ${cx - 30} 112 C ${cx - 40} 180, ${cx - 36} 250, ${cx - 40} 315`} fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 2" />
            <path d={`M ${cx - 12} 102 C ${cx - 22} 170, ${cx - 20} 240, ${cx - 26} 315`} fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 2" />
            <path d={`M ${cx + 12} 102 C ${cx + 22} 170, ${cx + 20} 240, ${cx + 26} 315`} fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 2" />
            <path d={`M ${cx + 30} 112 C ${cx + 40} 180, ${cx + 36} 250, ${cx + 40} 315`} fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 2" />
            <path d={`M ${cx + 46} 124 C ${cx + 56} 190, ${cx + 52} 260, ${cx + 56} 315`} fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 2" />
          </g>
        );
      })()}

      {/* High Hairline Indicator */}
      {(hairlineId === "other_hairline_high") && (
        <g id="forensic-hairline-high">
          <path
            d={`M ${cx - crWidth + 10} 118 C ${cx - 52} 110, ${cx - 44} 84, ${cx - 28} 74 C ${cx - 14} 68, ${cx + 14} 68, ${cx + 28} 74 C ${cx + 44} 84, ${cx + 52} 110, ${cx + crWidth - 10} 118`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            className="opacity-80"
          />
          <line x1={cx - 36} y1={77} x2={cx - 32} y2={84} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1 2" className="opacity-50" />
          <line x1={cx + 36} y1={77} x2={cx + 32} y2={84} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1 2" className="opacity-50" />
        </g>
      )}

      {/* Low Hairline Indicator */}
      {(hairlineId === "other_hairline_low") && (
        <g id="forensic-hairline-low">
          <path
            d={`M ${cx - crWidth + 8} 122 C ${cx - 50} 116, ${cx - 42} 104, ${cx - 24} 98 C ${cx - 12} 96, ${cx + 12} 96, ${cx + 24} 98 C ${cx + 42} 104, ${cx + 50} 116, ${cx + crWidth - 8} 122`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            className="opacity-80"
          />
          <line x1={cx - 20} y1={97} x2={cx - 18} y2={102} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1 2" className="opacity-50" />
          <line x1={cx + 20} y1={97} x2={cx + 18} y2={102} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1 2" className="opacity-50" />
        </g>
      )}

      {/* Widow's Peak Hairline Indicator */}
      {(hairlineId === "hairline_widows_peak" || hairlineId === "other_hairline_widows_peak") && (
        <g id="forensic-hairline-widows-peak">
          <path
            d={`M ${cx - crWidth + 8} 118 C ${cx - 48} 108, ${cx - 24} 88, ${cx} 96 C ${cx + 24} 88, ${cx + 48} 108, ${cx + crWidth - 8} 118`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
}

/**
 * Forensic Facial Details (Beards, Moustaches, Scars, Moles)
 * Only renders when actively selected.
 */
export function ForensicFacialDetailsLayer({
  selectedFeatures,
  cranialParams,
}: {
  selectedFeatures: Record<string, FeatureItem>;
  cranialParams: CranialAnchorPoints;
}) {
  const beardItem =
    selectedFeatures["beard"] ||
    selectedFeatures["facial_hair"] ||
    (selectedFeatures["other_features"]?.id?.includes("beard") ? selectedFeatures["other_features"] : undefined);
  const beardId = beardItem?.id;
  const beardSelected = Boolean(beardId);

  const moustacheItem =
    selectedFeatures["moustache"] ||
    (selectedFeatures["facial_hair"]?.id?.includes("moustache") ? selectedFeatures["facial_hair"] : undefined) ||
    (selectedFeatures["other_features"]?.id?.includes("moustache") ? selectedFeatures["other_features"] : undefined);
  const moustacheId = moustacheItem?.id;
  const moustacheSelected = Boolean(moustacheId);

  const scarSelected =
    selectedFeatures["facial_details"]?.id === "other_scar" ||
    selectedFeatures["other_features"]?.id === "other_scar";
  const moleSelected =
    selectedFeatures["facial_details"]?.id === "other_mole" ||
    selectedFeatures["other_features"]?.id === "other_mole";
  const browScarSelected = selectedFeatures["facial_details"]?.id === "mark_brow_scar";
  const cheekSlashSelected = selectedFeatures["facial_details"]?.id === "mark_cheek_scar";
  const teardropSelected = selectedFeatures["facial_details"]?.id === "mark_teardrop_tattoo";
  const templeTattooSelected = selectedFeatures["facial_details"]?.id === "mark_temple_tattoo";
  const frecklesSelected = selectedFeatures["facial_details"]?.id === "mark_freckles";
  const cleftChinSelected = selectedFeatures["facial_details"]?.id === "mark_cleft_chin";
  const monroeSelected = selectedFeatures["facial_details"]?.id === "mark_monroe_spot";
  const cheekSpotSelected = selectedFeatures["facial_details"]?.id === "mark_cheek_spot";
  const softFrecklesSelected = selectedFeatures["facial_details"]?.id === "mark_soft_freckles";
  const noseStudSelected = selectedFeatures["facial_details"]?.id === "mark_nose_stud";
  const lipLabretSelected = selectedFeatures["facial_details"]?.id === "mark_lip_labret";
  const eyebrowRingSelected = selectedFeatures["facial_details"]?.id === "mark_eyebrow_ring";

  const isDetail = Boolean(
    beardSelected ||
    moustacheSelected ||
    scarSelected ||
    moleSelected ||
    browScarSelected ||
    cheekSlashSelected ||
    teardropSelected ||
    templeTattooSelected ||
    frecklesSelected ||
    cleftChinSelected ||
    monroeSelected ||
    cheekSpotSelected ||
    softFrecklesSelected ||
    noseStudSelected ||
    lipLabretSelected ||
    eyebrowRingSelected
  );

  const triggerKey = isDetail
    ? [
        beardId || "",
        moustacheId || "",
        scarSelected ? "scar" : "",
        moleSelected ? "mole" : "",
        browScarSelected ? "b_scar" : "",
        cheekSlashSelected ? "c_scar" : "",
        teardropSelected ? "tear" : "",
        templeTattooSelected ? "cross" : "",
        frecklesSelected ? "freck" : "",
        cleftChinSelected ? "cleft" : "",
        monroeSelected ? "monroe" : "",
        cheekSpotSelected ? "c_spot" : "",
        softFrecklesSelected ? "s_freck" : "",
        noseStudSelected ? "n_stud" : "",
        lipLabretSelected ? "l_labret" : "",
        eyebrowRingSelected ? "e_ring" : "",
      ]
        .filter(Boolean)
        .join("_")
    : undefined;

  // Unconditional hook call at top level for React 19 compliance
  const revealRef = useFeatureGSAPReveal(triggerKey, "160px 240px", 2);

  if (!isDetail) return null;

  const cx = 160;

  // Anatomical skull landmarks
  const ckX = cranialParams.cheekX;
  const ckY = cranialParams.cheekY;
  const gnX = cranialParams.gonialX;
  const gnY = cranialParams.gonialY;
  const cbX = cranialParams.chinBaseX;
  const cbY = cranialParams.chinBaseY;
  const chY = cranialParams.chinApexY;

  const lckX = cx - (ckX - cx);
  const lgnX = cx - (gnX - cx);
  const lcbX = cx - (cbX - cx);

  // Sideburn base anchors (ear attachment region)
  const rSbX = cranialParams.earRootX - 4;
  const rSbY = cranialParams.earRootY + 16;
  const lSbX = cx - (rSbX - cx);
  const lSbY = rSbY;

  return (
    <g ref={revealRef} id="forensic-layer-details" className="forensic-sketch-feature">
      {/* ─── BEARDS ─────────────────────────────────────── */}
      {/* 1. Full Beard (beard_full, other_beard) */}
      {(beardId === "beard_full" || beardId === "other_beard") && (() => {
        // Outer mandibular contour following the actual jaw and chin wireframe
        const outerBeard =
          `M ${lSbX.toFixed(2)} ${lSbY.toFixed(2)} ` +
          `C ${(lSbX - 2).toFixed(2)} ${(lSbY + 18).toFixed(2)}, ${(lgnX - 4).toFixed(2)} ${(gnY - 14).toFixed(2)}, ${lgnX.toFixed(2)} ${gnY.toFixed(2)} ` +
          `C ${(lgnX + 4).toFixed(2)} ${(gnY + 16).toFixed(2)}, ${(lcbX - 10).toFixed(2)} ${(cbY - 4).toFixed(2)}, ${lcbX.toFixed(2)} ${cbY.toFixed(2)} ` +
          `C ${(lcbX + 8).toFixed(2)} ${(chY + 3).toFixed(2)}, ${(cx - 6).toFixed(2)} ${(chY + 3).toFixed(2)}, ${cx} ${(chY + 3).toFixed(2)} ` +
          `C ${(cx + 6).toFixed(2)} ${(chY + 3).toFixed(2)}, ${(cbX - 8).toFixed(2)} ${(chY + 3).toFixed(2)}, ${cbX.toFixed(2)} ${cbY.toFixed(2)} ` +
          `C ${(cbX + 10).toFixed(2)} ${(cbY - 4).toFixed(2)}, ${(gnX - 4).toFixed(2)} ${(gnY + 16).toFixed(2)}, ${gnX.toFixed(2)} ${gnY.toFixed(2)} ` +
          `C ${(gnX + 4).toFixed(2)} ${(gnY - 14).toFixed(2)}, ${(rSbX + 2).toFixed(2)} ${(lSbY + 18).toFixed(2)}, ${rSbX.toFixed(2)} ${rSbY.toFixed(2)}`;

        // Inner cheek and mouth cut-out line
        const innerBeard =
          `C ${(ckX - 8).toFixed(2)} ${(ckY + 14).toFixed(2)}, ${(cx + 34).toFixed(2)} 224, ${(cx + 26).toFixed(2)} 240 ` +
          `C ${(cx + 20).toFixed(2)} 258, ${(cx + 12).toFixed(2)} 262, ${cx} 262 ` +
          `C ${(cx - 12).toFixed(2)} 262, ${(cx - 20).toFixed(2)} 258, ${(cx - 26).toFixed(2)} 240 ` +
          `C ${(cx - 34).toFixed(2)} 224, ${(lckX + 8).toFixed(2)} ${(ckY + 14).toFixed(2)}, ${lSbX.toFixed(2)} ${lSbY.toFixed(2)} Z`;

        return (
          <g id="forensic-beard-full">
            {/* Volumetric Beard Mass Fill */}
            <path
              d={`${outerBeard} ${innerBeard}`}
              fill="rgba(16, 19, 29, 0.65)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Upper Cheek Cut Line */}
            <path
              d={
                `M ${lSbX.toFixed(2)} ${lSbY.toFixed(2)} ` +
                `C ${(lckX + 8).toFixed(2)} ${(ckY + 14).toFixed(2)}, ${(cx - 34).toFixed(2)} 224, ${(cx - 26).toFixed(2)} 240 ` +
                `C ${(cx - 20).toFixed(2)} 258, ${(cx - 12).toFixed(2)} 262, ${cx} 262 ` +
                `C ${(cx + 12).toFixed(2)} 262, ${(cx + 20).toFixed(2)} 258, ${(cx + 26).toFixed(2)} 240 ` +
                `C ${(cx + 34).toFixed(2)} 224, ${(ckX - 8).toFixed(2)} ${(ckY + 14).toFixed(2)}, ${rSbX.toFixed(2)} ${rSbY.toFixed(2)}`
              }
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            {/* Left Jaw Directional Hatching */}
            <path
              d={`M ${(lgnX + 10).toFixed(2)} ${(gnY + 2).toFixed(2)} L ${(lcbX + 4).toFixed(2)} ${(cbY - 6).toFixed(2)}`}
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-70"
            />
            <path
              d={`M ${(lgnX + 16).toFixed(2)} ${(gnY + 12).toFixed(2)} L ${(lcbX + 12).toFixed(2)} ${(cbY + 2).toFixed(2)}`}
              stroke="#CBD5E1"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-60"
            />
            {/* Right Jaw Directional Hatching */}
            <path
              d={`M ${(gnX - 10).toFixed(2)} ${(gnY + 2).toFixed(2)} L ${(cbX - 4).toFixed(2)} ${(cbY - 6).toFixed(2)}`}
              stroke="#94A3B8"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="opacity-70"
            />
            <path
              d={`M ${(gnX - 16).toFixed(2)} ${(gnY + 12).toFixed(2)} L ${(cbX - 12).toFixed(2)} ${(cbY + 2).toFixed(2)}`}
              stroke="#CBD5E1"
              strokeWidth="1.0"
              strokeLinecap="round"
              className="opacity-60"
            />
            {/* Chin Tuft Vertical Hatching */}
            <path
              d={`M ${cx - 8} 266 L ${cx - 8} 290 M ${cx} 265 L ${cx} 293 M ${cx + 8} 266 L ${cx + 8} 290`}
              stroke="#E2E8F0"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-80"
            />
          </g>
        );
      })()}

      {/* 2. Goatee (beard_goatee) */}
      {(beardId === "beard_goatee") && (() => {
        const goateePath =
          `M ${(cx - 24).toFixed(2)} 238 ` +
          `C ${(cx - 28).toFixed(2)} 254, ${(cx - 24).toFixed(2)} 280, ${(lcbX + 10).toFixed(2)} ${cbY.toFixed(2)} ` +
          `C ${(cx - 10).toFixed(2)} ${(chY + 3).toFixed(2)}, ${(cx + 10).toFixed(2)} ${(chY + 3).toFixed(2)}, ${(cbX - 10).toFixed(2)} ${cbY.toFixed(2)} ` +
          `C ${(cx + 24).toFixed(2)} 280, ${(cx + 28).toFixed(2)} 254, ${(cx + 24).toFixed(2)} 238 ` +
          `C ${(cx + 18).toFixed(2)} 256, ${(cx + 12).toFixed(2)} 260, ${cx} 260 ` +
          `C ${(cx - 12).toFixed(2)} 260, ${(cx - 18).toFixed(2)} 256, ${(cx - 24).toFixed(2)} 238 Z`;

        return (
          <g id="forensic-beard-goatee">
            <path
              d={goateePath}
              fill="rgba(16, 19, 29, 0.68)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Goatee Upper Chin Border */}
            <path
              d={`M ${cx - 20} 248 C ${cx - 12} 260, ${cx + 12} 260, ${cx + 20} 248`}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Chin Tuft Hatching */}
            <path
              d={`M ${cx - 6} 266 L ${cx - 6} 290 M ${cx} 264 L ${cx} 293 M ${cx + 6} 266 L ${cx + 6} 290`}
              stroke="#E2E8F0"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-80"
            />
          </g>
        );
      })()}

      {/* 3. Heavy Stubble (beard_stubble) */}
      {(beardId === "beard_stubble") && (() => {
        const stubblePath =
          `M ${lSbX.toFixed(2)} ${lSbY.toFixed(2)} ` +
          `C ${(lSbX - 2).toFixed(2)} ${(lSbY + 18).toFixed(2)}, ${(lgnX - 4).toFixed(2)} ${(gnY - 14).toFixed(2)}, ${lgnX.toFixed(2)} ${gnY.toFixed(2)} ` +
          `C ${(lgnX + 4).toFixed(2)} ${(gnY + 16).toFixed(2)}, ${(lcbX - 10).toFixed(2)} ${(cbY - 4).toFixed(2)}, ${lcbX.toFixed(2)} ${cbY.toFixed(2)} ` +
          `C ${(lcbX + 8).toFixed(2)} ${(chY + 3).toFixed(2)}, ${(cx - 6).toFixed(2)} ${(chY + 3).toFixed(2)}, ${cx} ${(chY + 3).toFixed(2)} ` +
          `C ${(cx + 6).toFixed(2)} ${(chY + 3).toFixed(2)}, ${(cbX - 8).toFixed(2)} ${(chY + 3).toFixed(2)}, ${cbX.toFixed(2)} ${cbY.toFixed(2)} ` +
          `C ${(cbX + 10).toFixed(2)} ${(cbY - 4).toFixed(2)}, ${(gnX - 4).toFixed(2)} ${(gnY + 16).toFixed(2)}, ${gnX.toFixed(2)} ${gnY.toFixed(2)} ` +
          `C ${(gnX + 4).toFixed(2)} ${(gnY - 14).toFixed(2)}, ${(rSbX + 2).toFixed(2)} ${(lSbY + 18).toFixed(2)}, ${rSbX.toFixed(2)} ${rSbY.toFixed(2)} ` +
          `C ${(ckX - 8).toFixed(2)} ${(ckY + 14).toFixed(2)}, ${(cx + 34).toFixed(2)} 224, ${(cx + 26).toFixed(2)} 240 ` +
          `C ${(cx + 20).toFixed(2)} 258, ${(cx + 12).toFixed(2)} 262, ${cx} 262 ` +
          `C ${(cx - 12).toFixed(2)} 262, ${(cx - 20).toFixed(2)} 258, ${(cx - 26).toFixed(2)} 240 ` +
          `C ${(cx - 34).toFixed(2)} 224, ${(lckX + 8).toFixed(2)} ${(ckY + 14).toFixed(2)}, ${lSbX.toFixed(2)} ${lSbY.toFixed(2)} Z`;

        return (
          <g id="forensic-beard-stubble">
            <path
              d={stubblePath}
              fill="rgba(30, 41, 59, 0.28)"
              className="opacity-90"
            />
            {/* Stipple Matrix across mandible */}
            <path
              d={`M ${lgnX + 12} ${gnY} L ${lgnX + 14} ${gnY} M ${lgnX + 24} ${gnY + 10} L ${lgnX + 26} ${gnY + 10} M ${cx - 30} 272 L ${cx - 28} 272 M ${cx - 10} 280 L ${cx - 8} 280 M ${cx + 10} 280 L ${cx + 12} 280 M ${cx + 30} 272 L ${cx + 32} 272 M ${gnX - 24} ${gnY + 10} L ${gnX - 22} ${gnY + 10} M ${gnX - 12} ${gnY} L ${gnX - 10} ${gnY}`}
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-75"
            />
            <g stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" className="opacity-75">
              <line x1={cx - 18} y1={262} x2={cx - 17} y2={265} />
              <line x1={cx - 8} y1={264} x2={cx - 7} y2={267} />
              <line x1={cx} y1={265} x2={cx} y2={268} />
              <line x1={cx + 8} y1={264} x2={cx + 7} y2={267} />
              <line x1={cx + 18} y1={262} x2={cx + 17} y2={265} />
              <line x1={cx - 24} y1={270} x2={cx - 23} y2={273} />
              <line x1={cx - 12} y1={274} x2={cx - 11} y2={277} />
              <line x1={cx} y1={276} x2={cx} y2={279} />
              <line x1={cx + 12} y1={274} x2={cx + 11} y2={277} />
              <line x1={cx + 24} y1={270} x2={cx + 23} y2={273} />
            </g>
          </g>
        );
      })()}

      {/* 4. Chin Strap (beard_chinstrap) */}
      {(beardId === "beard_chinstrap") && (() => {
        const outerStrap =
          `M ${lSbX.toFixed(2)} ${lSbY.toFixed(2)} ` +
          `C ${(lSbX - 1).toFixed(2)} ${(lSbY + 22).toFixed(2)}, ${(lgnX - 2).toFixed(2)} ${(gnY - 10).toFixed(2)}, ${(lgnX - 1).toFixed(2)} ${gnY.toFixed(2)} ` +
          `C ${(lgnX).toFixed(2)} ${(gnY + 12).toFixed(2)}, ${(lcbX - 1).toFixed(2)} ${(cbY + 3).toFixed(2)}, ${cx.toFixed(2)} ${(chY + 8).toFixed(2)} ` +
          `C ${(cbX + 1).toFixed(2)} ${(cbY + 3).toFixed(2)}, ${(gnX).toFixed(2)} ${(gnY + 12).toFixed(2)}, ${(gnX + 1).toFixed(2)} ${gnY.toFixed(2)} ` +
          `C ${(gnX + 2).toFixed(2)} ${(gnY - 10).toFixed(2)}, ${(rSbX + 1).toFixed(2)} ${(rSbY + 22).toFixed(2)}, ${rSbX.toFixed(2)} ${rSbY.toFixed(2)}`;

        const innerStrap =
          `C ${(rSbX - 6).toFixed(2)} ${(rSbY + 22).toFixed(2)}, ${(gnX - 7).toFixed(2)} ${(gnY - 8).toFixed(2)}, ${(gnX - 8).toFixed(2)} ${(gnY + 2).toFixed(2)} ` +
          `C ${(gnX - 8).toFixed(2)} ${(gnY + 10).toFixed(2)}, ${(cbX - 6).toFixed(2)} ${(cbY - 2).toFixed(2)}, ${cx.toFixed(2)} ${(chY - 2).toFixed(2)} ` +
          `C ${(lcbX + 6).toFixed(2)} ${(cbY - 2).toFixed(2)}, ${(lgnX + 8).toFixed(2)} ${(gnY + 10).toFixed(2)}, ${(lgnX + 8).toFixed(2)} ${(gnY + 2).toFixed(2)} ` +
          `C ${(lgnX + 7).toFixed(2)} ${(gnY - 8).toFixed(2)}, ${(lSbX + 6).toFixed(2)} ${(lSbY + 22).toFixed(2)}, ${lSbX.toFixed(2)} ${lSbY.toFixed(2)} Z`;

        return (
          <g id="forensic-beard-chinstrap">
            <path
              d={`${outerStrap} ${innerStrap}`}
              fill="rgba(16, 19, 29, 0.70)"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })()}

      {/* 5. Van Dyke (beard_vandyke) */}
      {(beardId === "beard_vandyke") && (() => {
        return (
          <g id="forensic-beard-vandyke">
            <path
              d={`M ${cx - 16} 260 C ${cx - 18} 272, ${cx - 12} 288, ${cx} ${(chY + 6).toFixed(2)} C ${cx + 12} 288, ${cx + 18} 272, ${cx + 16} 260 Z`}
              fill="rgba(16, 19, 29, 0.75)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1={cx - 5} y1={265} x2={cx - 3} y2={292} stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
            <line x1={cx} y1={263} x2={cx} y2={298} stroke="#E2E8F0" strokeWidth="1.3" strokeLinecap="round" />
            <line x1={cx + 5} y1={265} x2={cx + 3} y2={292} stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );
      })()}

      {/* ─── MOUSTACHES ─────────────────────────────────── */}
      {/* 1. Classic Moustache */}
      {(moustacheSelected && (moustacheId === "other_moustache" || !moustacheId.startsWith("moustache_"))) && (
        <g id="forensic-moustache-classic">
          <path
            d={`M ${cx - 24} 242 C ${cx - 16} 234, ${cx - 8} 231, ${cx} 233 C ${cx + 8} 231, ${cx + 16} 234, ${cx + 24} 242 C ${cx + 18} 243, ${cx + 8} 240, ${cx} 241 C ${cx - 8} 240, ${cx - 18} 243, ${cx - 24} 242 Z`}
            fill="#1E293B"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d={`M ${cx - 14} 235 C ${cx - 8} 234, ${cx - 3} 234, ${cx} 235`} stroke="#CBD5E1" strokeWidth="0.9" fill="none" className="opacity-70" />
          <path d={`M ${cx} 235 C ${cx + 3} 234, ${cx + 8} 234, ${cx + 14} 235`} stroke="#CBD5E1" strokeWidth="0.9" fill="none" className="opacity-70" />
        </g>
      )}

      {/* 2. Pencil Thin Moustache */}
      {moustacheId === "moustache_pencil" && (
        <g id="forensic-moustache-pencil">
          <path
            d={`M ${cx - 22} 242 C ${cx - 12} 240, ${cx + 12} 240, ${cx + 22} 242`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.0"
            strokeLinecap="round"
          />
          <line x1={cx - 20} y1={242} x2={cx + 20} y2={242} stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}

      {/* 3. Handlebar Moustache */}
      {moustacheId === "moustache_handlebar" && (
        <g id="forensic-moustache-handlebar">
          <path
            d={`M ${cx - 32} 246 C ${cx - 34} 240, ${cx - 24} 234, ${cx} 236 C ${cx + 24} 234, ${cx + 34} 240, ${cx + 32} 246 C ${cx + 36} 252, ${cx + 34} 256, ${cx + 30} 254 C ${cx + 26} 250, ${cx + 24} 242, ${cx} 243 C ${cx - 24} 242, ${cx - 26} 250, ${cx - 30} 254 C ${cx - 34} 256, ${cx - 36} 252, ${cx - 32} 246 Z`}
            fill="rgba(15, 23, 42, 0.95)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d={`M ${cx - 28} 244 C ${cx - 20} 238, ${cx} 238, ${cx + 20} 238`} fill="none" stroke="#CBD5E1" strokeWidth="0.9" />
        </g>
      )}

      {/* 4. Thick Chevron / Walrus */}
      {moustacheId === "moustache_chevron" && (
        <g id="forensic-moustache-chevron">
          <path
            d={`M ${cx - 28} 248 C ${cx - 22} 234, ${cx - 8} 230, ${cx} 232 C ${cx + 8} 230, ${cx + 22} 234, ${cx + 28} 248 C ${cx + 24} 254, ${cx + 10} 252, ${cx} 250 C ${cx - 10} 252, ${cx - 24} 254, ${cx - 28} 248 Z`}
            fill="rgba(15, 23, 42, 0.95)"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <line x1={cx - 14} y1={236} x2={cx - 16} y2={248} stroke="#CBD5E1" strokeWidth="1.1" />
          <line x1={cx - 6} y1={234} x2={cx - 6} y2={249} stroke="#CBD5E1" strokeWidth="1.1" />
          <line x1={cx} y1={233} x2={cx} y2={250} stroke="#FFFFFF" strokeWidth="1.2" />
          <line x1={cx + 6} y1={234} x2={cx + 6} y2={249} stroke="#CBD5E1" strokeWidth="1.1" />
          <line x1={cx + 14} y1={236} x2={cx + 16} y2={248} stroke="#CBD5E1" strokeWidth="1.1" />
        </g>
      )}

      {/* 5. Pyramidal / Toothbrush Moustache */}
      {moustacheId === "moustache_pyramidal" && (
        <g id="forensic-moustache-pyramidal">
          <polygon points={`${cx - 10},234 ${cx + 10},234 ${cx + 12},245 ${cx - 12},245`} fill="rgba(15, 23, 42, 0.95)" stroke="#FFFFFF" strokeWidth="1.4" />
          <line x1={cx - 4} y1={236} x2={cx - 4} y2={243} stroke="#CBD5E1" strokeWidth="1.0" />
          <line x1={cx} y1={235} x2={cx} y2={244} stroke="#FFFFFF" strokeWidth="1.2" />
          <line x1={cx + 4} y1={236} x2={cx + 4} y2={243} stroke="#CBD5E1" strokeWidth="1.0" />
        </g>
      )}

      {/* ─── SCARS, TATTOOS & MARKS ──────────────────────── */}
      {/* 1. Classic Facial Scar */}
      {scarSelected && (
        <g id="forensic-scar">
          <line x1={cx + 34} y1={172} x2={cx + 44} y2={194} stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
          <line x1={cx + 31} y1={178} x2={cx + 37} y2={176} stroke="#CBD5E1" strokeWidth="1.0" />
          <line x1={cx + 36} y1={185} x2={cx + 42} y2={183} stroke="#CBD5E1" strokeWidth="1.0" />
        </g>
      )}

      {/* 2. Mole */}
      {moleSelected && (
        <circle id="forensic-mole" cx={cx - 36} cy={202} r="1.9" fill="#0A0E17" stroke="#CBD5E1" strokeWidth="0.6" />
      )}

      {/* 3. Eyebrow Vertical Scar */}
      {browScarSelected && (
        <g id="forensic-brow-scar">
          <line x1={cx + 46} y1={122} x2={cx + 46} y2={136} stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
          <line x1={cx + 44} y1={127} x2={cx + 48} y2={127} stroke="#CBD5E1" strokeWidth="0.8" />
          <line x1={cx + 44} y1={131} x2={cx + 48} y2={131} stroke="#CBD5E1" strokeWidth="0.8" />
        </g>
      )}

      {/* 4. Traumatic Cheek Slash Scar */}
      {cheekSlashSelected && (
        <g id="forensic-cheek-slash">
          <path d={`M ${cx - 44} 174 C ${cx - 36} 186, ${cx - 26} 200, ${cx - 20} 214`} fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          <line x1={cx - 42} y1={180} x2={cx - 36} y2={176} stroke="#CBD5E1" strokeWidth="1.2" />
          <line x1={cx - 35} y1={191} x2={cx - 29} y2={187} stroke="#CBD5E1" strokeWidth="1.2" />
          <line x1={cx - 28} y1={202} x2={cx - 22} y2={198} stroke="#CBD5E1" strokeWidth="1.2" />
        </g>
      )}

      {/* 5. Teardrop Eye Tattoo */}
      {teardropSelected && (
        <path
          d={`M ${cx - 52} 158 C ${cx - 52} 158, ${cx - 55} 163, ${cx - 55} 165 C ${cx - 55} 167, ${cx - 52} 168.5, ${cx - 49} 165 C ${cx - 49} 163, ${cx - 52} 158, ${cx - 52} 158 Z`}
          fill="#0F172A"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
      )}

      {/* 6. Temple Cross Tattoo */}
      {templeTattooSelected && (
        <g id="forensic-temple-tattoo">
          <line x1={cx + 74} y1={120} x2={cx + 74} y2={134} stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" />
          <line x1={cx + 69} y1={125} x2={cx + 79} y2={125} stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx={cx + 74} cy={125} r="0.8" fill="#FFFFFF" />
        </g>
      )}

      {/* 7. Dense Freckles */}
      {frecklesSelected && (
        <g id="forensic-freckles" fill="#94A3B8" opacity={0.65}>
          <circle cx={cx - 22} cy={186} r="1.1" /><circle cx={cx - 16} cy={182} r="1.0" /><circle cx={cx - 10} cy={188} r="1.2" />
          <circle cx={cx - 18} cy={194} r="1.3" /><circle cx={cx - 12} cy={198} r="0.9" /><circle cx={cx - 4} cy={184} r="1.1" />
          <circle cx={cx} cy={190} r="1.3" /><circle cx={cx} cy={182} r="1.0" /><circle cx={cx + 4} cy={190} r="1.2" />
          <circle cx={cx + 10} cy={188} r="1.0" /><circle cx={cx + 16} cy={182} r="1.1" /><circle cx={cx + 22} cy={186} r="1.2" />
          <circle cx={cx + 18} cy={194} r="1.3" /><circle cx={cx + 12} cy={198} r="1.0" /><circle cx={cx + 24} cy={192} r="0.9" />
        </g>
      )}

      {/* 8. Cleft Chin */}
      {cleftChinSelected && (
        <g id="forensic-cleft-chin">
          <path
            d={`M ${cx - 4} ${chY - 10} C ${cx - 2} ${chY - 4}, ${cx} ${chY}, ${cx} ${chY + 3} C ${cx} ${chY}, ${cx + 2} ${chY - 4}, ${cx + 4} ${chY - 10}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={chY - 1} r="1.4" fill="#0A0E17" stroke="#CBD5E1" strokeWidth="0.8" />
        </g>
      )}

      {/* 9. Monroe Beauty Spot (Above left upper lip) */}
      {monroeSelected && (
        <circle cx={cx - 14} cy={242} r="1.8" fill="#0A0E17" stroke="#CBD5E1" strokeWidth="0.8" />
      )}

      {/* 10. Cheek Beauty Mark (High cheekbone spot) */}
      {cheekSpotSelected && (
        <circle cx={cx + 34} cy={188} r="1.8" fill="#0A0E17" stroke="#CBD5E1" strokeWidth="0.8" />
      )}

      {/* 11. Delicate Bridge Freckles */}
      {softFrecklesSelected && (
        <g id="forensic-soft-freckles" fill="#94A3B8" opacity={0.6}>
          <circle cx={cx - 8} cy={192} r="0.9" /><circle cx={cx - 4} cy={195} r="0.8" /><circle cx={cx} cy={193} r="0.9" />
          <circle cx={cx + 4} cy={195} r="0.8" /><circle cx={cx + 8} cy={192} r="0.9" /><circle cx={cx - 12} cy={196} r="0.7" />
          <circle cx={cx + 12} cy={196} r="0.7" />
        </g>
      )}

      {/* 12. Nostril Stud Piercing */}
      {noseStudSelected && (
        <g id="forensic-nose-stud">
          <circle cx={cx + 12} cy={213} r="2.0" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.7" />
          <circle cx={cx + 11.5} cy={212.5} r="0.7" fill="#FFFFFF" />
        </g>
      )}

      {/* 13. Lip Labret Piercing */}
      {lipLabretSelected && (
        <g id="forensic-lip-labret">
          <circle cx={cx} cy={263} r="2.2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.7" />
          <circle cx={cx - 0.6} cy={262.4} r="0.8" fill="#FFFFFF" />
        </g>
      )}

      {/* 14. Eyebrow Ring Piercing */}
      {eyebrowRingSelected && (
        <g id="forensic-eyebrow-ring">
          <ellipse cx={cx + 64} cy={127} rx="2.5" ry="4.5" fill="none" stroke="#E2E8F0" strokeWidth="1.2" transform={`rotate(-15, ${cx + 64}, 127)`} />
          <circle cx={cx + 63} cy={123} r="1.1" fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
}

/**
 * Forensic Eyewear Layer (Glasses & Sunglasses)
 * Positioned in front of the orbital zone and nasal bridge.
 */
export function ForensicEyewearLayer({
  selectedFeatures,
}: {
  selectedFeatures: Record<string, FeatureItem>;
}) {
  const glassesItem = selectedFeatures["eyewear"];
  const glassesId = glassesItem?.id;
  const isVisible = Boolean(glassesId);
  const revealRef = useFeatureGSAPReveal(isVisible ? glassesId : undefined, "160px 146px", 2);

  if (!isVisible) return null;

  const cx = 160;
  const eyeY = 146;
  const leftX = cx - 46;
  const rightX = cx + 46;

  return (
    <g id="forensic-eyewear-layer" ref={revealRef}>
      {/* 1. Wire-Rim Oval */}
      {glassesId === "glasses_wire_rim" && (
        <g id="forensic-glasses-wire-rim">
          <line x1={leftX - 25} y1={eyeY - 2} x2={cx - 76} y2={eyeY - 6} stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
          <line x1={rightX + 25} y1={eyeY - 2} x2={cx + 76} y2={eyeY - 6} stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx={leftX} cy={eyeY} rx={25} ry={18} fill="rgba(241, 245, 249, 0.08)" stroke="#FFFFFF" strokeWidth="1.6" />
          <ellipse cx={rightX} cy={eyeY} rx={25} ry={18} fill="rgba(241, 245, 249, 0.08)" stroke="#FFFFFF" strokeWidth="1.6" />
          <path d={`M ${leftX + 25} ${eyeY - 2} C ${cx} ${eyeY - 8}, ${rightX - 25} ${eyeY - 2}`} fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
          <line x1={leftX - 14} y1={eyeY - 10} x2={leftX - 4} y2={eyeY - 5} stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity={0.6} />
          <line x1={rightX - 14} y1={eyeY - 10} x2={rightX - 4} y2={eyeY - 5} stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity={0.6} />
        </g>
      )}

      {/* 2. Modern Rectangular */}
      {glassesId === "glasses_rectangular" && (
        <g id="forensic-glasses-rectangular">
          <line x1={leftX - 27} y1={eyeY - 4} x2={cx - 78} y2={eyeY - 8} stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" />
          <line x1={rightX + 27} y1={eyeY - 4} x2={cx + 78} y2={eyeY - 8} stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" />
          <rect x={leftX - 26} y={eyeY - 15} width={52} height={30} rx={4} fill="rgba(15, 23, 42, 0.15)" stroke="#0F172A" strokeWidth="2.8" />
          <rect x={leftX - 26} y={eyeY - 15} width={52} height={30} rx={4} fill="none" stroke="#FFFFFF" strokeWidth="1.0" opacity={0.7} />
          <rect x={rightX - 26} y={eyeY - 15} width={52} height={30} rx={4} fill="rgba(15, 23, 42, 0.15)" stroke="#0F172A" strokeWidth="2.8" />
          <rect x={rightX - 26} y={eyeY - 15} width={52} height={30} rx={4} fill="none" stroke="#FFFFFF" strokeWidth="1.0" opacity={0.7} />
          <line x1={leftX + 26} y1={eyeY - 6} x2={rightX - 26} y2={eyeY - 6} stroke="#0F172A" strokeWidth="3.0" strokeLinecap="round" />
          <line x1={leftX + 26} y1={eyeY - 6} x2={rightX - 26} y2={eyeY - 6} stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity={0.8} />
        </g>
      )}

      {/* 3. Thick Horn-Rim / Acetate */}
      {glassesId === "glasses_horn_rim" && (
        <g id="forensic-glasses-horn-rim">
          <line x1={leftX - 28} y1={eyeY - 6} x2={cx - 79} y2={eyeY - 10} stroke="#0F172A" strokeWidth="3.8" strokeLinecap="round" />
          <line x1={rightX + 28} y1={eyeY - 6} x2={cx + 79} y2={eyeY - 10} stroke="#0F172A" strokeWidth="3.8" strokeLinecap="round" />
          <rect x={leftX - 27} y={eyeY - 17} width={54} height={34} rx={6} fill="rgba(15, 23, 42, 0.20)" stroke="#0F172A" strokeWidth="4.0" />
          <rect x={rightX - 27} y={eyeY - 17} width={54} height={34} rx={6} fill="rgba(15, 23, 42, 0.20)" stroke="#0F172A" strokeWidth="4.0" />
          <path d={`M ${leftX + 27} ${eyeY - 4} C ${cx} ${eyeY - 13}, ${rightX - 27} ${eyeY - 4}`} fill="none" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx={leftX - 23} cy={eyeY - 13} r={1.2} fill="#E2E8F0" />
          <circle cx={rightX + 23} cy={eyeY - 13} r={1.2} fill="#E2E8F0" />
        </g>
      )}

      {/* 4. Aviator Pilot Wire */}
      {glassesId === "glasses_aviator" && (
        <g id="forensic-glasses-aviator">
          <line x1={leftX - 18} y1={eyeY - 17} x2={rightX + 18} y2={eyeY - 17} stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
          <path
            d={`M ${leftX - 27} ${eyeY - 14} C ${leftX} ${eyeY - 14}, ${leftX + 25} ${eyeY - 14}, ${leftX + 25} ${eyeY - 2} C ${leftX + 25} ${eyeY + 14}, ${leftX + 8} ${eyeY + 22}, ${leftX - 6} ${eyeY + 20} C ${leftX - 22} ${eyeY + 18}, ${leftX - 28} ${eyeY + 8}, ${leftX - 27} ${eyeY - 14} Z`}
            fill="rgba(241, 245, 249, 0.08)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />
          <path
            d={`M ${rightX + 27} ${eyeY - 14} C ${rightX} ${eyeY - 14}, ${rightX - 25} ${eyeY - 14}, ${rightX - 25} ${eyeY - 2} C ${rightX - 25} ${eyeY + 14}, ${rightX - 8} ${eyeY + 22}, ${rightX + 6} ${eyeY + 20} C ${rightX + 22} ${eyeY + 18}, ${rightX + 28} ${eyeY + 8}, ${rightX + 27} ${eyeY - 14} Z`}
            fill="rgba(241, 245, 249, 0.08)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />
          <path d={`M ${leftX + 25} ${eyeY - 5} C ${cx} ${eyeY - 10}, ${rightX - 25} ${eyeY - 5}`} fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
        </g>
      )}

      {/* 5. Browline / Clubmaster */}
      {glassesId === "glasses_browline" && (
        <g id="forensic-glasses-browline">
          <path d={`M ${leftX - 28} ${eyeY - 7} C ${leftX - 16} ${eyeY - 18}, ${leftX + 16} ${eyeY - 18}, ${leftX + 26} ${eyeY - 7} L ${leftX + 26} ${eyeY - 1} C ${leftX + 14} ${eyeY - 10}, ${leftX - 14} ${eyeY - 10}, ${leftX - 28} ${eyeY - 1} Z`} fill="#0F172A" stroke="#FFFFFF" strokeWidth="0.8" />
          <path d={`M ${rightX + 28} ${eyeY - 7} C ${rightX + 16} ${eyeY - 18}, ${rightX - 16} ${eyeY - 18}, ${rightX - 26} ${eyeY - 7} L ${rightX - 26} ${eyeY - 1} C ${rightX - 14} ${eyeY - 10}, ${rightX + 14} ${eyeY - 10}, ${rightX + 28} ${eyeY - 1} Z`} fill="#0F172A" stroke="#FFFFFF" strokeWidth="0.8" />
          <path d={`M ${leftX - 28} ${eyeY - 1} C ${leftX - 28} ${eyeY + 16}, ${leftX + 26} ${eyeY + 16}, ${leftX + 26} ${eyeY - 1}`} fill="rgba(241, 245, 249, 0.08)" stroke="#CBD5E1" strokeWidth="1.4" />
          <path d={`M ${rightX - 26} ${eyeY - 1} C ${rightX - 26} ${eyeY + 16}, ${rightX + 28} ${eyeY + 16}, ${rightX + 28} ${eyeY - 1}`} fill="rgba(241, 245, 249, 0.08)" stroke="#CBD5E1" strokeWidth="1.4" />
          <line x1={leftX + 26} y1={eyeY - 5} x2={rightX - 26} y2={eyeY - 5} stroke="#CBD5E1" strokeWidth="1.8" />
        </g>
      )}

      {/* 6. Dark Tinted Sunglasses */}
      {glassesId === "glasses_sunglasses" && (
        <g id="forensic-glasses-sunglasses">
          <line x1={leftX - 28} y1={eyeY - 4} x2={cx - 78} y2={eyeY - 8} stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" />
          <line x1={rightX + 28} y1={eyeY - 4} x2={cx + 78} y2={eyeY - 8} stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" />
          <rect x={leftX - 27} y={eyeY - 16} width={54} height={32} rx={5} fill="rgba(10, 14, 23, 0.94)" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect x={rightX - 27} y={eyeY - 16} width={54} height={32} rx={5} fill="rgba(10, 14, 23, 0.94)" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1={leftX + 27} y1={eyeY - 5} x2={rightX - 27} y2={eyeY - 5} stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points={`${leftX - 16},${eyeY - 14} ${leftX - 8},${eyeY - 14} ${leftX - 20},${eyeY + 14} ${leftX - 24},${eyeY + 14}`} fill="#FFFFFF" opacity={0.28} />
          <polygon points={`${rightX - 16},${eyeY - 14} ${rightX - 8},${eyeY - 14} ${rightX - 20},${eyeY + 14} ${rightX - 24},${eyeY + 14}`} fill="#FFFFFF" opacity={0.28} />
        </g>
      )}
    </g>
  );
}

/**
 * Forensic Headwear & Coverings Layer
 * Positioned on top of the cranial vault and forehead.
 */
export function ForensicHeadwearLayer({
  selectedFeatures,
  cranialParams,
}: {
  selectedFeatures: Record<string, FeatureItem>;
  cranialParams: CranialAnchorPoints;
}) {
  const capItem = selectedFeatures["headwear"];
  const capId = capItem?.id;
  const isVisible = Boolean(capId);
  const revealRef = useFeatureGSAPReveal(isVisible ? capId : undefined, "160px 100px", 2);

  if (!isVisible) return null;

  const cx = 160;
  const crownY = cranialParams.crownY;
  const crWidth = cranialParams.parietalX - cx;

  return (
    <g id="forensic-headwear-layer" ref={revealRef}>
      {/* 1. Baseball Cap (Forward) */}
      {capId === "headwear_baseball_front" && (
        <g id="forensic-cap-front">
          <path
            d={`M ${(cx - crWidth + 4).toFixed(2)} 118 C ${(cx - crWidth + 2).toFixed(2)} 48, ${cx - 48} ${(crownY - 8).toFixed(2)}, ${cx} ${(crownY - 8).toFixed(2)} C ${cx + 48} ${(crownY - 8).toFixed(2)}, ${(cx + crWidth - 2).toFixed(2)} 48, ${(cx + crWidth - 4).toFixed(2)} 118 Z`}
            fill="rgba(15, 23, 42, 0.95)"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <line x1={cx} y1={crownY - 8} x2={cx} y2={118} stroke="#64748B" strokeWidth="1.2" />
          <path d={`M ${cx - 32} ${crownY + 4} C ${cx - 24} 78, ${cx - 16} 102, ${cx - 14} 118`} fill="none" stroke="#64748B" strokeWidth="1.0" />
          <path d={`M ${cx + 32} ${crownY + 4} C ${cx + 24} 78, ${cx + 16} 102, ${cx + 14} 118`} fill="none" stroke="#64748B" strokeWidth="1.0" />
          <ellipse cx={cx} cy={crownY - 8} rx={4} ry={2.2} fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.0" />
          <path
            d={`M ${(cx - crWidth - 10).toFixed(2)} 118 C ${cx - 42} 136, ${cx + 42} 136, ${(cx + crWidth + 10).toFixed(2)} 118 C ${cx + 52} 110, ${cx - 52} 110, ${(cx - crWidth - 10).toFixed(2)} 118 Z`}
            fill="#0F172A"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* 2. Baseball Cap (Backwards) */}
      {capId === "headwear_baseball_back" && (
        <g id="forensic-cap-back">
          <path
            d={`M ${(cx - crWidth + 4).toFixed(2)} 118 C ${(cx - crWidth + 2).toFixed(2)} 48, ${cx - 48} ${(crownY - 8).toFixed(2)}, ${cx} ${(crownY - 8).toFixed(2)} C ${cx + 48} ${(crownY - 8).toFixed(2)}, ${(cx + crWidth - 2).toFixed(2)} 48, ${(cx + crWidth - 4).toFixed(2)} 118 Z`}
            fill="rgba(15, 23, 42, 0.95)"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d={`M ${cx - 20} 118 C ${cx - 20} 98, ${cx + 20} 98, ${cx + 20} 118 Z`}
            fill="rgba(30, 41, 59, 0.5)"
            stroke="#FFFFFF"
            strokeWidth="1.4"
          />
          <line x1={cx - 18} y1={112} x2={cx + 18} y2={112} stroke="#CBD5E1" strokeWidth="2.2" />
        </g>
      )}

      {/* 3. Knit Beanie */}
      {capId === "headwear_beanie" && (
        <g id="forensic-cap-beanie">
          <path
            d={`M ${(cx - crWidth + 6).toFixed(2)} 124 C ${(cx - crWidth + 4).toFixed(2)} 52, ${cx - 46} ${(crownY - 4).toFixed(2)}, ${cx} ${(crownY - 4).toFixed(2)} C ${cx + 46} ${(crownY - 4).toFixed(2)}, ${(cx + crWidth - 4).toFixed(2)} 52, ${(cx + crWidth - 6).toFixed(2)} 124 Z`}
            fill="rgba(30, 41, 59, 0.95)"
            stroke="#FFFFFF"
            strokeWidth="1.6"
          />
          <line x1={cx - 28} y1={crownY + 8} x2={cx - 28} y2={124} stroke="#64748B" strokeWidth="1.2" />
          <line x1={cx - 14} y1={crownY + 2} x2={cx - 14} y2={124} stroke="#64748B" strokeWidth="1.2" />
          <line x1={cx} y1={crownY - 4} x2={cx} y2={124} stroke="#64748B" strokeWidth="1.2" />
          <line x1={cx + 14} y1={crownY + 2} x2={cx + 14} y2={124} stroke="#64748B" strokeWidth="1.2" />
          <line x1={cx + 28} y1={crownY + 8} x2={cx + 28} y2={124} stroke="#64748B" strokeWidth="1.2" />
          <rect
            x={cx - crWidth + 2}
            y={120}
            width={(crWidth - 2) * 2}
            height={20}
            rx={4}
            fill="#0F172A"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />
        </g>
      )}

      {/* 4. Hoodie (Hood Up) */}
      {capId === "headwear_hoodie" && (
        <g id="forensic-cap-hoodie">
          <path
            d={`M ${(cx - crWidth - 18).toFixed(2)} 280 C ${(cx - crWidth - 22).toFixed(2)} 180, ${(cx - crWidth - 8).toFixed(2)} 60, ${cx} ${(crownY - 14).toFixed(2)} C ${(cx + crWidth + 8).toFixed(2)} 60, ${(cx + crWidth + 22).toFixed(2)} 180, ${(cx + crWidth + 18).toFixed(2)} 280 C ${(cx + crWidth).toFixed(2)} 265, ${cx + 56} 250, ${cx + 54} 190 C ${cx + 56} 120, ${cx + 42} 100, ${cx} 100 C ${cx - 42} 100, ${cx - 56} 120, ${cx - 54} 190 C ${cx - 56} 250, ${(cx - crWidth).toFixed(2)} 265, ${(cx - crWidth - 18).toFixed(2)} 280 Z`}
            fill="rgba(15, 23, 42, 0.95)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <line x1={cx - 34} y1={210} x2={cx - 34} y2={260} stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
          <line x1={cx + 34} y1={210} x2={cx + 34} y2={260} stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
        </g>
      )}

      {/* 5. Flat Cap / Newsboy */}
      {capId === "headwear_flat_cap" && (
        <g id="forensic-cap-flat">
          <path
            d={`M ${(cx - crWidth + 4).toFixed(2)} 124 C ${(cx - crWidth).toFixed(2)} 70, ${cx - 42} 56, ${cx} 56 C ${cx + 48} 56, ${(cx + crWidth + 6).toFixed(2)} 76, ${(cx + crWidth + 8).toFixed(2)} 118 C ${cx + 46} 124, ${cx - 46} 124, ${(cx - crWidth + 4).toFixed(2)} 124 Z`}
            fill="rgba(30, 41, 59, 0.95)"
            stroke="#FFFFFF"
            strokeWidth="1.6"
          />
          <path
            d={`M ${cx - 48} 124 C ${cx - 24} 134, ${cx + 24} 134, ${cx + 48} 124 Z`}
            fill="#0F172A"
            stroke="#FFFFFF"
            strokeWidth="1.6"
          />
        </g>
      )}
    </g>
  );
}

/**
 * Composite Portrait Features Renderer
 * Integrates active facial features onto the clean cranial silhouette in exact anatomical depth order.
 */
export function ForensicPortraitFeatures({
  selectedFeatures,
  cranialParams,
}: PortraitProps) {
  return (
    <svg
      viewBox="0 0 320 400"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 1. Cheeks & Zygomatic Bone Structure */}
      <ForensicCheeksLayer selectedFeatures={selectedFeatures} cranialParams={cranialParams} />

      {/* 2. Forensic Age Lines & Facial Furrows */}
      <ForensicAgeLinesLayer selectedFeatures={selectedFeatures} />

      {/* 3. Eyebrows */}
      <ForensicEyebrowsLayer selectedFeatures={selectedFeatures} />

      {/* 4. Eyes */}
      <ForensicEyesLayer selectedFeatures={selectedFeatures} />

      {/* 5. Nose */}
      <ForensicNoseLayer selectedFeatures={selectedFeatures} />

      {/* 6. Mouth */}
      <ForensicMouthLayer selectedFeatures={selectedFeatures} />

      {/* 7. Oral Dentition (Teeth) */}
      <ForensicTeethLayer selectedFeatures={selectedFeatures} />

      {/* 8. Facial Details (Beards, Moustaches, Scars & Tattoos) */}
      <ForensicFacialDetailsLayer selectedFeatures={selectedFeatures} cranialParams={cranialParams} />

      {/* 9. Hair & Hairline */}
      <ForensicHairLayer selectedFeatures={selectedFeatures} cranialParams={cranialParams} />

      {/* 10. Eyewear & Glasses (in front of eyes & nose bridge) */}
      <ForensicEyewearLayer selectedFeatures={selectedFeatures} />

      {/* 11. Headwear & Caps (on top of cranial vault) */}
      <ForensicHeadwearLayer selectedFeatures={selectedFeatures} cranialParams={cranialParams} />
    </svg>
  );
}
