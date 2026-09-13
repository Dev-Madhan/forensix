"use client";

import React from "react";

interface FacialFeatureIconProps {
  svgType: string;
  className?: string;
  strokeWidth?: number;
}

/**
 * Premium Forensic Facial-Feature Vector Icon Component
 * Renders clinical monochrome forensic pencil-sketch illustrations
 * with realistic anatomy, subtle graphite shading, and crisp vector contours.
 */
export function FacialFeatureIcon({
  svgType,
  className = "size-full",
}: FacialFeatureIconProps) {
  switch (svgType) {
    case "face_oval":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M50 15 C30 15 23 28 23 48 C23 70 33 83 50 86 C67 83 77 70 77 48 C77 28 70 15 50 15 Z" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2" />
    
    <path d="M25 35 C24 48 26 62 33 73" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
    <path d="M75 35 C76 48 74 62 67 73" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
    </g>

        </svg>
      );

    case "face_round":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <circle cx="50" cy="50" r="34" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2" />
    
    <path d="M22 44 C20 54 24 66 34 74" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
    <path d="M78 44 C80 54 76 66 66 74" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
    
    </g>

        </svg>
      );

    case "face_square":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M25 22 L25 62 C25 73 36 82 50 82 C64 82 75 73 75 62 L75 22 C64 18 36 18 25 22 Z" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2" />
    
    
    
    <line x1="28" y1="30" x2="28" y2="55" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" />
    <line x1="72" y1="30" x2="72" y2="55" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "face_oblong":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M50 14 C35 14 30 24 30 38 L30 62 C30 76 38 86 50 86 C62 86 70 76 70 62 L70 38 C70 24 65 14 50 14 Z" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2" />
    
    <line x1="33" y1="32" x2="33" y2="66" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" />
    <line x1="67" y1="32" x2="67" y2="66" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" />
    
    </g>

        </svg>
      );

    case "face_diamond":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M50 15 C42 15 37 23 35 34 C21 46 21 54 24 58 C29 68 39 79 50 86 C61 79 71 68 76 58 C79 54 79 46 65 34 C63 23 58 15 50 15 Z" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2" />
    
    
    <path d="M26 53 C30 65 38 74 48 81" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
    <path d="M74 53 C70 65 62 74 52 81" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
    
    </g>

        </svg>
      );

    case "face_heart":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M50 21 C44 15 32 15 24 24 C21 42 29 64 50 86 C71 64 79 42 76 24 C68 15 56 15 50 21 Z" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2" />
    
    <path d="M45 78 C48 81 52 81 55 78" stroke="#1E293B" strokeWidth="1.6" fill="none" />
    
    <path d="M30 26 C38 22 46 23 50 25 C54 23 62 22 70 26" stroke="#64748B" strokeWidth="1.2" fill="none" />
    
    <path d="M28 42 C32 55 40 68 47 75" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
    <path d="M72 42 C68 55 60 68 53 75" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
  
  </g>

        </svg>
      );

    case "jaw_soft":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M22 28 C24 50 34 72 50 78 C66 72 76 50 78 28" fill="none" stroke="#1E293B" strokeWidth="2.4" />
    <path d="M28 34 C30 52 38 68 50 72 C62 68 70 52 72 34" fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="2 2" />
    <path d="M44 75 C47 77 53 77 56 75" stroke="#64748B" strokeWidth="1.6" fill="none" />
  
  </g>

        </svg>
      );

    case "jaw_rounded":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M20 28 C20 54 30 78 50 80 C70 78 80 54 80 28" fill="none" stroke="#1E293B" strokeWidth="2.4" />
    <path d="M26 36 C28 56 36 72 50 74 C64 72 72 56 74 36" fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
    <ellipse cx="50" cy="74" rx="7" ry="2.5" fill="#E2E8F0" />
  
  </g>

        </svg>
      );

    case "jaw_angular":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M22 26 L22 52 L38 72 L50 75 L62 72 L78 52 L78 26" fill="none" stroke="#1E293B" strokeWidth="2.4" />
    
    <line x1="22" y1="52" x2="30" y2="57" stroke="#64748B" strokeWidth="1.6" />
    <line x1="78" y1="52" x2="70" y2="57" stroke="#64748B" strokeWidth="1.6" />
    <path d="M26 53 L38 68 L50 71 L62 68 L74 53" fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
  
  </g>

        </svg>
      );

    case "jaw_wide":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M15 30 L17 58 C20 72 34 79 50 81 C66 79 80 72 83 58 L85 30" fill="none" stroke="#1E293B" strokeWidth="2.4" />
    <line x1="20" y1="56" x2="80" y2="56" stroke="#CBD5E1" strokeWidth="0.8" strokeDasharray="2 3" />
    <path d="M22 57 C25 68 36 74 50 75 C64 74 75 68 78 57" fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
  
  </g>

        </svg>
      );

    case "jaw_narrow":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M28 26 C29 48 38 72 50 82 C62 72 71 48 72 26" fill="none" stroke="#1E293B" strokeWidth="2.4" />
    <path d="M33 34 C35 52 42 69 50 76 C58 69 65 52 67 34" fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
    <circle cx="50" cy="78" r="2" fill="#64748B" />
  
  </g>

        </svg>
      );

    case "jaw_square":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M18 28 L18 60 L32 76 L68 76 L82 60 L82 28" fill="none" stroke="#1E293B" strokeWidth="2.4" />
    <line x1="32" y1="76" x2="68" y2="76" stroke="#1E293B" strokeWidth="2.4" />
    
    <path d="M18 60 L28 66 L38 72" fill="none" stroke="#64748B" strokeWidth="1.4" />
    <path d="M82 60 L72 66 L62 72" fill="none" stroke="#64748B" strokeWidth="1.4" />
    <line x1="34" y1="72" x2="66" y2="72" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
  
  </g>

        </svg>
      );

    case "chin_rounded":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M30 40 C33 60 38 76 50 78 C62 76 67 60 70 40" fill="none" stroke="#1E293B" strokeWidth="2.2" />
    
    <path d="M38 46 C44 49 56 49 62 46" stroke="#64748B" strokeWidth="1.6" fill="none" />
    
    <ellipse cx="50" cy="62" rx="10" ry="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
    <path d="M44 72 C47 74 53 74 56 72" stroke="#1E293B" strokeWidth="1.8" fill="none" />
  
  </g>

        </svg>
      );

    case "chin_pointed":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M28 38 C32 54 42 74 50 82 C58 74 68 54 72 38" fill="none" stroke="#1E293B" strokeWidth="2.2" />
    <path d="M39 48 C44 51 56 51 61 48" stroke="#64748B" strokeWidth="1.6" fill="none" />
    
    <line x1="46" y1="76" x2="50" y2="82" stroke="#1E293B" strokeWidth="2.2" />
    <line x1="54" y1="76" x2="50" y2="82" stroke="#1E293B" strokeWidth="2.2" />
    <ellipse cx="50" cy="66" rx="5" ry="7" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "chin_broad":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M22 38 C25 56 32 72 40 76 L60 76 C68 72 75 56 78 38" fill="none" stroke="#1E293B" strokeWidth="2.2" />
    <line x1="40" y1="76" x2="60" y2="76" stroke="#1E293B" strokeWidth="2.4" />
    <path d="M34 46 C42 49 58 49 66 46" stroke="#64748B" strokeWidth="1.6" fill="none" />
    
    <circle cx="43" cy="64" r="5" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" />
    <circle cx="57" cy="64" r="5" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "chin_narrow":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M32 38 C35 55 42 74 46 78 L54 78 C58 74 65 55 68 38" fill="none" stroke="#1E293B" strokeWidth="2.2" />
    <line x1="46" y1="78" x2="54" y2="78" stroke="#1E293B" strokeWidth="2.2" />
    <path d="M40 48 C45 50 55 50 60 48" stroke="#64748B" strokeWidth="1.4" fill="none" />
    <ellipse cx="50" cy="66" rx="6" ry="7" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "chin_square":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M24 38 L25 58 L36 74 L64 74 L75 58 L76 38" fill="none" stroke="#1E293B" strokeWidth="2.2" />
    <line x1="36" y1="74" x2="64" y2="74" stroke="#1E293B" strokeWidth="2.4" />
    
    <line x1="34" y1="46" x2="66" y2="46" stroke="#64748B" strokeWidth="1.6" />
    <line x1="36" y1="74" x2="40" y2="60" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" />
    <line x1="64" y1="74" x2="60" y2="60" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "chin_receding":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M26 36 C30 52 38 68 45 74 C49 76 53 76 56 74 C62 68 68 52 72 36" fill="none" stroke="#1E293B" strokeWidth="2.2" />
    
    <path d="M36 44 C42 47 56 47 62 44" stroke="#475569" strokeWidth="1.8" fill="none" />
    
    <path d="M38 52 C44 58 54 58 60 52" stroke="#94A3B8" strokeWidth="1.4" strokeDasharray="2 2" fill="none" />
    
    <line x1="50" y1="36" x2="50" y2="78" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 3" />
    <path d="M47 70 C49 72 51 72 53 70" stroke="#64748B" strokeWidth="1.4" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_almond":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M20 40 C35 30 65 30 80 40" stroke="#64748B" strokeWidth="1.4" fill="none" />
    
    <path d="M15 50 C26 36 74 36 85 50 C74 64 26 64 15 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2" />
    
    <circle cx="50" cy="50" r="13" fill="url(#iris-grad)" stroke="#1E293B" strokeWidth="1.4" />
    <circle cx="50" cy="50" r="5.5" fill="#0F172A" />
    
    <circle cx="47" cy="47" r="2.2" fill="#FFFFFF" />
    
    <path d="M15 50 C26 36 74 36 85 50" stroke="#0F172A" strokeWidth="2.8" fill="none" />
    
    <path d="M15 50 C17 52 19 50 18 48" stroke="#64748B" strokeWidth="1.2" fill="none" />
    
    <path d="M22 62 C38 67 62 67 78 62" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_round":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M22 34 C36 24 64 24 78 34" stroke="#64748B" strokeWidth="1.4" fill="none" />
    <path d="M18 50 C26 30 74 30 82 50 C74 70 26 70 18 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2" />
    <circle cx="50" cy="50" r="14.5" fill="url(#iris-grad)" stroke="#1E293B" strokeWidth="1.4" />
    <circle cx="50" cy="50" r="6" fill="#0F172A" />
    <circle cx="46" cy="46" r="2.5" fill="#FFFFFF" />
    
    <path d="M18 50 C26 30 74 30 82 50" stroke="#0F172A" strokeWidth="2.8" fill="none" />
    
    <path d="M24 65 C38 72 62 72 76 65" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_narrow":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    <clipPath id="narrow-clip"><path d="M12 50 C28 41 72 41 88 50 C72 59 28 59 12 50 Z" /></clipPath>
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M20 44 C35 38 65 38 80 44" stroke="#64748B" strokeWidth="1.2" fill="none" />
    <path d="M12 50 C28 41 72 41 88 50 C72 59 28 59 12 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2" />
    
    <g clipPath="url(#narrow-clip)">
      <circle cx="50" cy="50" r="12" fill="url(#iris-grad)" stroke="#1E293B" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="5" fill="#0F172A" />
      <circle cx="47" cy="48" r="1.8" fill="#FFFFFF" />
    </g>
    <path d="M12 50 C28 41 72 41 88 50" stroke="#0F172A" strokeWidth="2.6" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_large":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M18 32 C34 20 66 20 82 32" stroke="#64748B" strokeWidth="1.5" fill="none" />
    <path d="M14 50 C24 28 76 28 86 50 C76 72 24 72 14 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.4" />
    <circle cx="50" cy="50" r="16" fill="url(#iris-grad)" stroke="#1E293B" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="7" fill="#0F172A" />
    <circle cx="45" cy="45" r="3.0" fill="#FFFFFF" />
    <path d="M14 50 C24 28 76 28 86 50" stroke="#0F172A" strokeWidth="3.0" fill="none" />
    <path d="M22 66 C36 74 64 74 78 66" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_small":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M26 43 C38 37 62 37 74 43" stroke="#64748B" strokeWidth="1.2" fill="none" />
    <path d="M22 50 C32 42 68 42 78 50 C68 58 32 58 22 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.0" />
    <circle cx="50" cy="50" r="9.5" fill="url(#iris-grad)" stroke="#1E293B" strokeWidth="1.2" />
    <circle cx="50" cy="50" r="4" fill="#0F172A" />
    <circle cx="48" cy="48" r="1.6" fill="#FFFFFF" />
    <path d="M22 50 C32 42 68 42 78 50" stroke="#0F172A" strokeWidth="2.4" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_deep_set":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M14 36 C30 25 70 25 86 36 C70 42 30 42 14 36 Z" fill="#E2E8F0" opacity="0.8" />
    <path d="M15 35 C32 25 68 25 85 35" stroke="#334155" strokeWidth="1.8" fill="none" />
    <path d="M18 50 C28 40 72 40 82 50 C72 60 28 60 18 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2" />
    <circle cx="50" cy="50" r="11" fill="url(#iris-grad)" stroke="#1E293B" strokeWidth="1.3" />
    <circle cx="50" cy="50" r="5" fill="#0F172A" />
    <circle cx="47" cy="47" r="1.8" fill="#FFFFFF" />
    <path d="M18 50 C28 40 72 40 82 50" stroke="#0F172A" strokeWidth="2.8" fill="none" />
    
    <line x1="26" y1="36" x2="30" y2="42" stroke="#94A3B8" strokeWidth="1.0" />
    <line x1="36" y1="34" x2="40" y2="41" stroke="#94A3B8" strokeWidth="1.0" />
    <line x1="64" y1="34" x2="60" y2="41" stroke="#94A3B8" strokeWidth="1.0" />
    <line x1="74" y1="36" x2="70" y2="42" stroke="#94A3B8" strokeWidth="1.0" />
  
  </g>

        </svg>
      );

    case "eye_sz_small":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M28 44 C38 39 62 39 72 44" stroke="#64748B" strokeWidth="1.2" fill="none" />
    <path d="M25 50 C33 43 67 43 75 50 C67 57 33 57 25 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="50" cy="50" r="8" fill="url(#iris-grad)" stroke="#1E293B" strokeWidth="1.2" />
    <circle cx="50" cy="50" r="3.5" fill="#0F172A" />
    <circle cx="48" cy="48" r="1.4" fill="#FFFFFF" />
    <path d="M25 50 C33 43 67 43 75 50" stroke="#0F172A" strokeWidth="2.2" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_sz_medium":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M22 41 C34 33 66 33 78 41" stroke="#64748B" strokeWidth="1.3" fill="none" />
    <path d="M18 50 C28 38 72 38 82 50 C72 62 28 62 18 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.0" />
    <circle cx="50" cy="50" r="11.5" fill="url(#iris-grad)" stroke="#1E293B" strokeWidth="1.3" />
    <circle cx="50" cy="50" r="5" fill="#0F172A" />
    <circle cx="47" cy="47" r="2.0" fill="#FFFFFF" />
    <path d="M18 50 C28 38 72 38 82 50" stroke="#0F172A" strokeWidth="2.6" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_sz_large":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M16 36 C32 24 68 24 84 36" stroke="#64748B" strokeWidth="1.5" fill="none" />
    <path d="M12 50 C24 32 76 32 88 50 C76 68 24 68 12 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.4" />
    <circle cx="50" cy="50" r="15" fill="url(#iris-grad)" stroke="#1E293B" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="6.5" fill="#0F172A" />
    <circle cx="46" cy="46" r="2.6" fill="#FFFFFF" />
    <path d="M12 50 C24 32 76 32 88 50" stroke="#0F172A" strokeWidth="3.0" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_pos_close":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M18 50 C23 43 37 43 42 50 C37 57 23 57 18 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="30" cy="50" r="5" fill="url(#iris-grad)" />
    <circle cx="30" cy="50" r="2.2" fill="#0F172A" />
    <path d="M18 50 C23 43 37 43 42 50" stroke="#0F172A" strokeWidth="2.2" fill="none" />
    
    <path d="M58 50 C63 43 77 43 82 50 C77 57 63 57 58 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="70" cy="50" r="5" fill="url(#iris-grad)" />
    <circle cx="70" cy="50" r="2.2" fill="#0F172A" />
    <path d="M58 50 C63 43 77 43 82 50" stroke="#0F172A" strokeWidth="2.2" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_pos_normal":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M14 50 C20 43 34 43 40 50 C34 57 20 57 14 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="27" cy="50" r="5.2" fill="url(#iris-grad)" />
    <circle cx="27" cy="50" r="2.2" fill="#0F172A" />
    <path d="M14 50 C20 43 34 43 40 50" stroke="#0F172A" strokeWidth="2.2" fill="none" />
    
    <path d="M60 50 C66 43 80 43 86 50 C80 57 66 57 60 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="73" cy="50" r="5.2" fill="url(#iris-grad)" />
    <circle cx="73" cy="50" r="2.2" fill="#0F172A" />
    <path d="M60 50 C66 43 80 43 86 50" stroke="#0F172A" strokeWidth="2.2" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_pos_wide":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M10 50 C16 43 30 43 36 50 C30 57 16 57 10 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="23" cy="50" r="5" fill="url(#iris-grad)" />
    <circle cx="23" cy="50" r="2.2" fill="#0F172A" />
    <path d="M10 50 C16 43 30 43 36 50" stroke="#0F172A" strokeWidth="2.2" fill="none" />
    
    <path d="M64 50 C70 43 84 43 90 50 C84 57 70 57 64 50 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="77" cy="50" r="5" fill="url(#iris-grad)" />
    <circle cx="77" cy="50" r="2.2" fill="#0F172A" />
    <path d="M64 50 C70 43 84 43 90 50" stroke="#0F172A" strokeWidth="2.2" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_pos_upturned":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M12 45 C19 41 33 46 39 52 C32 58 18 53 12 45 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="26" cy="48" r="5.2" fill="url(#iris-grad)" />
    <circle cx="26" cy="48" r="2.2" fill="#0F172A" />
    <path d="M12 45 C19 41 33 46 39 52" stroke="#0F172A" strokeWidth="2.4" fill="none" />
    
    <path d="M61 52 C67 46 81 41 88 45 C82 53 68 58 61 52 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="74" cy="48" r="5.2" fill="url(#iris-grad)" />
    <circle cx="74" cy="48" r="2.2" fill="#0F172A" />
    <path d="M61 52 C67 46 81 41 88 45" stroke="#0F172A" strokeWidth="2.4" fill="none" />
  
  </g>

        </svg>
      );

    case "eye_pos_downturned":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M12 55 C19 47 33 44 39 48 C33 56 19 61 12 55 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="26" cy="51" r="5.2" fill="url(#iris-grad)" />
    <circle cx="26" cy="51" r="2.2" fill="#0F172A" />
    <path d="M12 55 C19 47 33 44 39 48" stroke="#0F172A" strokeWidth="2.4" fill="none" />
    
    <path d="M61 48 C67 44 81 47 88 55 C81 61 67 56 61 48 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="74" cy="51" r="5.2" fill="url(#iris-grad)" />
    <circle cx="74" cy="51" r="2.2" fill="#0F172A" />
    <path d="M61 48 C67 44 81 47 88 55" stroke="#0F172A" strokeWidth="2.4" fill="none" />
  
  </g>

        </svg>
      );

    case "brow_straight":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M15 49 C32 46.5 65 46.5 85 49 C80 44 65 42 50 42 C34 42 20 44.5 15 49 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
    
    <line x1="17" y1="49" x2="22" y2="43.5" stroke="#475569" strokeWidth="1.2" />
    <line x1="26" y1="48" x2="33" y2="42.5" stroke="#475569" strokeWidth="1.2" />
    <line x1="38" y1="47" x2="46" y2="42.5" stroke="#475569" strokeWidth="1.2" />
    <line x1="52" y1="46.5" x2="60" y2="43" stroke="#475569" strokeWidth="1.2" />
    <line x1="66" y1="47.5" x2="74" y2="45" stroke="#475569" strokeWidth="1.2" />
    <line x1="78" y1="49" x2="84" y2="48" stroke="#475569" strokeWidth="1.2" />
  
  </g>

        </svg>
      );

    case "brow_arched":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M14 56 C28 42 58 32 70 32 C78 33 83 42 86 48 C80 43 74 38 66 38 C54 38 30 48 14 56 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
    
    <line x1="18" y1="54" x2="24" y2="48" stroke="#475569" strokeWidth="1.2" />
    <line x1="32" y1="46" x2="40" y2="40" stroke="#475569" strokeWidth="1.2" />
    <line x1="48" y1="40" x2="56" y2="35.5" stroke="#475569" strokeWidth="1.2" />
    <line x1="64" y1="35" x2="71" y2="34" stroke="#475569" strokeWidth="1.2" />
    <line x1="74" y1="36" x2="80" y2="42" stroke="#475569" strokeWidth="1.2" />
    <line x1="81" y1="44" x2="85" y2="48" stroke="#475569" strokeWidth="1.2" />
  
  </g>

        </svg>
      );

    case "brow_thick":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M12 55 C24 39 50 35 68 36 C78 38 84 45 88 53 C80 45 72 42 62 42 C46 42 26 48 12 55 Z" fill="#0F172A" stroke="#0F172A" strokeWidth="1.4" />
    
    <path d="M14 55 C26 46 48 43 65 43 C74 43 82 49 86 53" stroke="#334155" strokeWidth="2.6" fill="none" />
    <line x1="15" y1="57" x2="20" y2="49" stroke="#1E293B" strokeWidth="1.4" />
    <line x1="26" y1="53" x2="33" y2="43" stroke="#1E293B" strokeWidth="1.4" />
    <line x1="42" y1="48" x2="50" y2="39" stroke="#1E293B" strokeWidth="1.4" />
    <line x1="58" y1="44" x2="66" y2="39" stroke="#1E293B" strokeWidth="1.4" />
    <line x1="72" y1="44" x2="79" y2="42" stroke="#1E293B" strokeWidth="1.4" />
  
  </g>

        </svg>
      );

    case "brow_thin":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M16 54 C30 42 56 37 68 37 C76 38 82 44 86 50 C82 46 76 41 68 40 C56 40 32 45 16 54 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
    <path d="M17 53 C30 42 56 38 68 38 C76 39 81 44 85 49" stroke="#334155" strokeWidth="1.4" fill="none" />
  
  </g>

        </svg>
      );

    case "brow_high_set":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M15 42 C28 29 58 24 70 25 C78 26 83 34 87 41 C80 34 73 30 65 30 C52 30 30 37 15 42 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
    
    <line x1="19" y1="41" x2="25" y2="34" stroke="#475569" strokeWidth="1.2" />
    <line x1="33" y1="34" x2="41" y2="29" stroke="#475569" strokeWidth="1.2" />
    <line x1="50" y1="29" x2="59" y2="27" stroke="#475569" strokeWidth="1.2" />
    <line x1="68" y1="28" x2="76" y2="32" stroke="#475569" strokeWidth="1.2" />
    <line x1="80" y1="36" x2="85" y2="41" stroke="#475569" strokeWidth="1.2" />
  
  </g>

        </svg>
      );

    case "brow_low_set":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="brow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1E293B"/>
      <stop offset="85%" stopColor="#0F172A"/>
      <stop offset="100%" stopColor="#334155"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />

  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M15 57 C30 47 62 47 85 52 C78 47 64 44 52 44 C36 44 22 49 15 57 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
    
    <line x1="17" y1="57" x2="23" y2="50" stroke="#475569" strokeWidth="1.2" />
    <line x1="30" y1="53" x2="38" y2="47" stroke="#475569" strokeWidth="1.2" />
    <line x1="46" y1="49" x2="55" y2="46" stroke="#475569" strokeWidth="1.2" />
    <line x1="64" y1="48" x2="72" y2="47" stroke="#475569" strokeWidth="1.2" />
    <line x1="76" y1="50" x2="83" y2="51.5" stroke="#475569" strokeWidth="1.2" />
  
  </g>

        </svg>
      );

    case "nose_straight":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M42 16 C44 21 45 27 45 34" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
    <path d="M58 16 C56 21 55 27 55 34" stroke="#475569" strokeWidth="1.4" fill="none" />

    
    <line x1="45" y1="34" x2="45" y2="55" stroke="#CBD5E1" strokeWidth="1.2" />
    <line x1="55" y1="34" x2="55" y2="55" stroke="#1E293B" strokeWidth="1.6" />
    
    <polygon points="46,34 54,34 56,55 46,55" fill="#E2E8F0" opacity="0.5" />

    
    <path d="M44 58 C47 56 53 56 56 58" stroke="#64748B" strokeWidth="1.3" fill="none" />
    <path d="M43 62 C46 64.5 54 64.5 57 62" stroke="#1E293B" strokeWidth="1.6" fill="none" />

    
    <path d="M33 59 C30 62 30 68 36 70" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M31 60 C30 63 30 67 33 70" stroke="#94A3B8" strokeWidth="1.0" fill="none" />

    
    <path d="M67 59 C70 62 70 68 64 70" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M69 60 C70 63 70 67 67 70" stroke="#475569" strokeWidth="1.2" fill="none" />

    
    <path d="M37 68.5 C38 66 42 66 44 68 C42 69.5 38 69.5 37 68.5 Z" fill="#0F172A" />
    <path d="M63 68.5 C62 66 58 66 56 68 C58 69.5 62 69.5 63 68.5 Z" fill="#0F172A" />

    
    <path d="M46 68 C48 71 52 71 54 68" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    
    <path d="M47 71 C49 73 51 73 53 71" stroke="#94A3B8" strokeWidth="1.4" strokeDasharray="1.5 1.5" fill="none" />

    
    <line x1="46" y1="74" x2="45" y2="83" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
    <line x1="54" y1="74" x2="55" y2="83" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "nose_broad":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M37 16 C41 22 42 28 41 36" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
    <path d="M63 16 C59 22 58 28 59 36" stroke="#475569" strokeWidth="1.4" fill="none" />

    
    <line x1="41" y1="36" x2="40" y2="55" stroke="#CBD5E1" strokeWidth="1.2" />
    <line x1="59" y1="36" x2="60" y2="55" stroke="#1E293B" strokeWidth="1.6" />
    <polygon points="41,36 59,36 61,55 39,55" fill="#E2E8F0" opacity="0.55" />

    
    <path d="M40 57 C45 55 55 55 60 57" stroke="#64748B" strokeWidth="1.3" fill="none" />
    <path d="M39 62 C43 65.5 57 65.5 61 62" stroke="#1E293B" strokeWidth="1.8" fill="none" />

    
    <path d="M26 60 C21 64 22 71 29 73" stroke="#1E293B" strokeWidth="2.2" fill="none" />
    <path d="M24 61 C22 65 23 70 27 73" stroke="#94A3B8" strokeWidth="1.1" fill="none" />

    <path d="M74 60 C79 64 78 71 71 73" stroke="#1E293B" strokeWidth="2.2" fill="none" />
    <path d="M76 61 C78 65 77 70 73 73" stroke="#475569" strokeWidth="1.3" fill="none" />

    
    <path d="M31 70 C33 67 39 67 42 69 C40 71 34 71 31 70 Z" fill="#0F172A" />
    <path d="M69 70 C67 67 61 67 58 69 C60 71 66 71 69 70 Z" fill="#0F172A" />

    
    <path d="M44 68.5 C47 72 53 72 56 68.5" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M45 72 C48 74.5 52 74.5 55 72" stroke="#94A3B8" strokeWidth="1.4" strokeDasharray="1.5 1.5" fill="none" />

    <line x1="43" y1="75" x2="42" y2="84" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
    <line x1="57" y1="75" x2="58" y2="84" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "nose_narrow":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M45 16 C46 21 47 27 47 35" stroke="#94A3B8" strokeWidth="1.1" strokeDasharray="2 2" fill="none" />
    <path d="M55 16 C54 21 53 27 53 35" stroke="#475569" strokeWidth="1.3" fill="none" />

    
    <line x1="47" y1="35" x2="47" y2="56" stroke="#CBD5E1" strokeWidth="1.1" />
    <line x1="53" y1="35" x2="53" y2="56" stroke="#1E293B" strokeWidth="1.5" />
    <polygon points="47,35 53,35 53,56 47,56" fill="#E2E8F0" opacity="0.45" />

    
    <path d="M46 59 C48 57.5 52 57.5 54 59" stroke="#64748B" strokeWidth="1.2" fill="none" />
    <path d="M45 62 C47 64 53 64 55 62" stroke="#1E293B" strokeWidth="1.5" fill="none" />

    
    <path d="M37 62 C34 64 34 69 39 71" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    <path d="M63 62 C66 64 66 69 61 71" stroke="#1E293B" strokeWidth="1.8" fill="none" />

    
    <ellipse cx="42" cy="69" rx="1.8" ry="2.6" fill="#0F172A" transform="rotate(12 42 69)" />
    <ellipse cx="58" cy="69" rx="1.8" ry="2.6" fill="#0F172A" transform="rotate(-12 58 69)" />

    
    <path d="M47 68.5 C48.5 71 51.5 71 53 68.5" stroke="#1E293B" strokeWidth="1.7" fill="none" />

    <line x1="47" y1="73" x2="46" y2="82" stroke="#CBD5E1" strokeWidth="0.9" strokeDasharray="1.5 2" />
    <line x1="53" y1="73" x2="54" y2="82" stroke="#CBD5E1" strokeWidth="0.9" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "nose_rounded":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M43 16 C45 22 46 28 45 36" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
    <path d="M57 16 C55 22 54 28 55 36" stroke="#475569" strokeWidth="1.4" fill="none" />

    <line x1="45" y1="36" x2="44" y2="53" stroke="#CBD5E1" strokeWidth="1.2" />
    <line x1="55" y1="36" x2="56" y2="53" stroke="#1E293B" strokeWidth="1.6" />
    <polygon points="45,36 55,36 56,53 44,53" fill="#E2E8F0" opacity="0.5" />

    
    <path d="M42 58 C42 54 45 52 50 52 C55 52 58 54 58 58" stroke="#64748B" strokeWidth="1.3" fill="none" />
    <path d="M41 62 C43 66.5 57 66.5 59 62" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    
    <ellipse cx="48" cy="58" rx="3.0" ry="2.2" fill="#FFFFFF" opacity="0.85" />

    
    <path d="M31 61 C27 64 27 70 33 72" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M30 62 C29 65 30 69 33 72" stroke="#94A3B8" strokeWidth="1.0" fill="none" />

    <path d="M69 61 C73 64 73 70 67 72" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M70 62 C71 65 70 69 67 72" stroke="#475569" strokeWidth="1.2" fill="none" />

    
    <path d="M35 70 C36 67.5 40 67.5 43 69.5 C41 71 37 71 35 70 Z" fill="#0F172A" />
    <path d="M65 70 C64 67.5 60 67.5 57 69.5 C59 71 63 71 65 70 Z" fill="#0F172A" />

    
    <path d="M46 69 C48 72 52 72 54 69" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M47 72 C49 74 51 74 53 72" stroke="#94A3B8" strokeWidth="1.3" strokeDasharray="1.5 1.5" fill="none" />

    <line x1="46" y1="74" x2="45" y2="83" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
    <line x1="54" y1="74" x2="55" y2="83" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "nose_pointed":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <line x1="45" y1="16" x2="46" y2="54" stroke="#CBD5E1" strokeWidth="1.2" />
    <line x1="55" y1="16" x2="54" y2="54" stroke="#1E293B" strokeWidth="1.6" />
    <polygon points="45,16 55,16 54,54 46,54" fill="#E2E8F0" opacity="0.45" />

    
    <path d="M46 56 L50 63.5 L54 56" stroke="#1E293B" strokeWidth="1.5" fill="none" />
    
    <path d="M44 63.5 L50 66.5 L56 63.5" stroke="#1E293B" strokeWidth="1.8" fill="none" />

    
    <path d="M33 61 C30 64 31 69 36 71" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M67 61 C70 64 69 69 64 71" stroke="#1E293B" strokeWidth="2.0" fill="none" />

    
    <polygon points="38,70 42,67 44,70" fill="#0F172A" />
    <polygon points="62,70 58,67 56,70" fill="#0F172A" />

    
    <path d="M47 67 L50 71 L53 67" stroke="#1E293B" strokeWidth="1.8" fill="none" />

    <line x1="46" y1="74" x2="45" y2="83" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
    <line x1="54" y1="74" x2="55" y2="83" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "nose_upturned":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M44 16 C46 25 46 36 44 46" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
    <path d="M56 16 C54 25 54 36 56 46" stroke="#475569" strokeWidth="1.4" fill="none" />

    <polygon points="44,26 56,26 56,46 44,46" fill="#E2E8F0" opacity="0.45" />

    
    <path d="M43 54 C46 51.5 54 51.5 57 54" stroke="#64748B" strokeWidth="1.4" fill="none" />
    <path d="M43 59 C46 61.5 54 61.5 57 59" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    <circle cx="48.5" cy="55.5" r="1.8" fill="#FFFFFF" opacity="0.9" />

    
    <path d="M31 60 C28 63 29 69 34 71" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M69 60 C72 63 71 69 66 71" stroke="#1E293B" strokeWidth="2.0" fill="none" />

    
    <ellipse cx="39" cy="65" rx="3.5" ry="2.6" fill="#0F172A" transform="rotate(-20 39 65)" />
    <ellipse cx="61" cy="65" rx="3.5" ry="2.6" fill="#0F172A" transform="rotate(20 61 65)" />

    
    <path d="M46 61 C48 67 52 67 54 61" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    
    <path d="M46 68 C48 71 52 71 54 68" stroke="#94A3B8" strokeWidth="1.3" strokeDasharray="1.5 1.5" fill="none" />

    <line x1="46" y1="73" x2="45" y2="82" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
    <line x1="54" y1="73" x2="55" y2="82" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="1.5 2" />
  
  </g>

        </svg>
      );

    case "mouth_thin":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="upper-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.85"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.95"/>
    </linearGradient>
    <linearGradient id="lower-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.95"/>
    </linearGradient>
    <radialGradient id="nose-tip-glow" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
      <stop offset="60%" stopColor="#F1F5F9" stopOpacity="0.6"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.7"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M45 28 C46 34 46 38 46 41" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
    <path d="M55 28 C54 34 54 38 54 41" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />

    
    <path d="M16 50 C28 47 43 44 47 42 C49 43 51 43 53 42 C57 44 72 47 84 50" stroke="#475569" strokeWidth="1.5" fill="none" />
    
    <path d="M16 50 C28 47 43 44 47 42 C49 43 51 43 53 42 C57 44 72 47 84 50 C72 51 56 51 50 51 C44 51 28 51 16 50 Z" fill="#CBD5E1" opacity="0.45" />

    
    <path d="M15 50 C26 49 44 51.5 50 51.5 C56 51.5 74 49 85 50" stroke="#0F172A" strokeWidth="2.6" fill="none" />
    
    <circle cx="15" cy="50" r="1.6" fill="#0F172A" />
    <circle cx="85" cy="50" r="1.6" fill="#0F172A" />

    
    <path d="M18 50 C28 57 72 57 82 50" stroke="#64748B" strokeWidth="1.6" fill="none" />
    
    <path d="M18 50 C28 57 72 57 82 50 C74 51 56 51.5 50 51.5 C44 51.5 26 51 18 50 Z" fill="#F1F5F9" opacity="0.6" />

    
    <path d="M38 64 C44 66 56 66 62 64" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
  
  </g>

        </svg>
      );

    case "mouth_medium":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="upper-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.85"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.95"/>
    </linearGradient>
    <linearGradient id="lower-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.95"/>
    </linearGradient>
    <radialGradient id="nose-tip-glow" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
      <stop offset="60%" stopColor="#F1F5F9" stopOpacity="0.6"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.7"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M44 26 C45 32 46 36 46 39" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
    <path d="M56 26 C55 32 54 36 54 39" stroke="#94A3B8" strokeWidth="1.2" fill="none" />

    
    <path d="M15 50 C26 44 42 38 47 36 C49 38 51 38 53 36 C58 38 74 44 85 50 C72 51 57 53 50 53 C43 53 28 51 15 50 Z" fill="url(#upper-lip-shade)" stroke="#1E293B" strokeWidth="1.8" />

    
    <path d="M47 36 C49 38 51 38 53 36" stroke="#1E293B" strokeWidth="2.0" fill="none" />

    
    <path d="M14 50 C25 49 42 53.5 50 53.5 C58 53.5 75 49 86 50" stroke="#0F172A" strokeWidth="2.6" fill="none" />
    <circle cx="14" cy="50" r="1.8" fill="#0F172A" />
    <circle cx="86" cy="50" r="1.8" fill="#0F172A" />

    
    <path d="M16 50 C24 64 76 64 84 50 C74 53 58 53.5 50 53.5 C42 53.5 26 53 16 50 Z" fill="url(#lower-lip-shade)" stroke="#1E293B" strokeWidth="1.8" />
    
    
    <ellipse cx="42" cy="56" rx="6" ry="2.2" fill="#FFFFFF" opacity="0.75" />
    <ellipse cx="58" cy="56" rx="6" ry="2.2" fill="#FFFFFF" opacity="0.75" />
    
    <line x1="38" y1="53" x2="39" y2="58" stroke="#CBD5E1" strokeWidth="1.0" />
    <line x1="50" y1="54" x2="50" y2="60" stroke="#CBD5E1" strokeWidth="1.0" />
    <line x1="62" y1="53" x2="61" y2="58" stroke="#CBD5E1" strokeWidth="1.0" />

    
    <path d="M34 68 C42 71 58 71 66 68" stroke="#64748B" strokeWidth="1.6" fill="none" />
  
  </g>

        </svg>
      );

    case "mouth_full":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="upper-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.85"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.95"/>
    </linearGradient>
    <linearGradient id="lower-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.95"/>
    </linearGradient>
    <radialGradient id="nose-tip-glow" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
      <stop offset="60%" stopColor="#F1F5F9" stopOpacity="0.6"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.7"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M43 24 C44 30 46 34 46 37" stroke="#64748B" strokeWidth="1.4" fill="none" />
    <path d="M57 24 C56 30 54 34 54 37" stroke="#64748B" strokeWidth="1.4" fill="none" />

    
    <path d="M13 50 C24 40 41 33 47 31 C49 34 51 34 53 31 C59 33 76 40 87 50 C74 52 58 55 50 55 C42 55 26 52 13 50 Z" fill="url(#upper-lip-shade)" stroke="#1E293B" strokeWidth="2.0" />

    
    <path d="M47 31 C49 34 51 34 53 31" stroke="#0F172A" strokeWidth="2.2" fill="none" />

    
    <path d="M12 50 C24 48 42 55 50 55 C58 55 76 48 88 50" stroke="#0F172A" strokeWidth="2.8" fill="none" />
    <circle cx="12" cy="50" r="2.0" fill="#0F172A" />
    <circle cx="88" cy="50" r="2.0" fill="#0F172A" />

    
    <path d="M15 50 C22 71 78 71 85 50 C76 54 58 55 50 55 C42 55 24 54 15 50 Z" fill="url(#lower-lip-shade)" stroke="#1E293B" strokeWidth="2.0" />

    
    <ellipse cx="40" cy="59" rx="8" ry="3.5" fill="#FFFFFF" opacity="0.8" />
    <ellipse cx="60" cy="59" rx="8" ry="3.5" fill="#FFFFFF" opacity="0.8" />
    <line x1="50" y1="56" x2="50" y2="66" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" />

    
    <path d="M30 75 C40 79 60 79 70 75" stroke="#475569" strokeWidth="2.0" fill="none" />
  
  </g>

        </svg>
      );

    case "mouth_wide":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="upper-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.85"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.95"/>
    </linearGradient>
    <linearGradient id="lower-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.95"/>
    </linearGradient>
    <radialGradient id="nose-tip-glow" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
      <stop offset="60%" stopColor="#F1F5F9" stopOpacity="0.6"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.7"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M45 28 C46 34 46 38 46 40" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
    <path d="M55 28 C54 34 54 38 54 40" stroke="#94A3B8" strokeWidth="1.2" fill="none" />

    
    <path d="M8 50 C22 43 42 39 47 38 C49 40 51 40 53 38 C58 39 78 43 92 50 C78 51 58 52.5 50 52.5 C42 52.5 22 51 8 50 Z" fill="url(#upper-lip-shade)" stroke="#1E293B" strokeWidth="1.8" />

    
    <path d="M7 50 C22 49 42 52.5 50 52.5 C58 52.5 78 49 93 50" stroke="#0F172A" strokeWidth="2.6" fill="none" />
    <circle cx="7" cy="50" r="1.8" fill="#0F172A" />
    <circle cx="93" cy="50" r="1.8" fill="#0F172A" />

    
    <path d="M10 50 C20 64 80 64 90 50 C78 52.5 58 52.5 50 52.5 C42 52.5 22 52.5 10 50 Z" fill="url(#lower-lip-shade)" stroke="#1E293B" strokeWidth="1.8" />

    
    <ellipse cx="38" cy="56" rx="10" ry="2.2" fill="#FFFFFF" opacity="0.75" />
    <ellipse cx="62" cy="56" rx="10" ry="2.2" fill="#FFFFFF" opacity="0.75" />

    
    <path d="M32 68 C42 71 58 71 68 68" stroke="#64748B" strokeWidth="1.6" fill="none" />
  
  </g>

        </svg>
      );

    case "mouth_narrow":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="upper-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.85"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.95"/>
    </linearGradient>
    <linearGradient id="lower-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.95"/>
    </linearGradient>
    <radialGradient id="nose-tip-glow" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
      <stop offset="60%" stopColor="#F1F5F9" stopOpacity="0.6"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.7"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M46 28 C47 34 47 37 47 40" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
    <path d="M54 28 C53 34 53 37 53 40" stroke="#94A3B8" strokeWidth="1.2" fill="none" />

    
    <path d="M25 50 C32 43 43 38 47 37 C49 39 51 39 53 37 C57 38 68 43 75 50 C66 52 56 53 50 53 C44 53 34 52 25 50 Z" fill="url(#upper-lip-shade)" stroke="#1E293B" strokeWidth="1.8" />

    
    <path d="M24 50 C33 49 43 53 50 53 C57 53 67 49 76 50" stroke="#0F172A" strokeWidth="2.6" fill="none" />
    <circle cx="24" cy="50" r="1.8" fill="#0F172A" />
    <circle cx="76" cy="50" r="1.8" fill="#0F172A" />

    
    <path d="M26 50 C32 64 68 64 74 50 C66 53 56 53 50 53 C44 53 34 53 26 50 Z" fill="url(#lower-lip-shade)" stroke="#1E293B" strokeWidth="1.8" />

    
    <ellipse cx="50" cy="57" rx="6" ry="2.5" fill="#FFFFFF" opacity="0.8" />

    
    <path d="M40 68 C44 70 56 70 60 68" stroke="#64748B" strokeWidth="1.6" fill="none" />
  
  </g>

        </svg>
      );

    case "mouth_downturned":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="pencil-shade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="upper-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.85"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.95"/>
    </linearGradient>
    <linearGradient id="lower-lip-shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.95"/>
    </linearGradient>
    <radialGradient id="nose-tip-glow" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
      <stop offset="60%" stopColor="#F1F5F9" stopOpacity="0.6"/>
      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.7"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M44 26 C45 32 46 36 46 39" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
    <path d="M56 26 C55 32 54 36 54 39" stroke="#94A3B8" strokeWidth="1.2" fill="none" />

    
    <path d="M15 56 C26 46 42 39 47 37 C49 39 51 39 53 37 C58 39 74 46 85 56 C74 53 58 50 50 50 C42 50 26 53 15 56 Z" fill="url(#upper-lip-shade)" stroke="#1E293B" strokeWidth="1.8" />

    
    <path d="M14 56 C24 48 42 49 50 49 C58 49 76 48 86 56" stroke="#0F172A" strokeWidth="2.6" fill="none" />
    
    <line x1="14" y1="56" x2="11" y2="62" stroke="#475569" strokeWidth="1.8" />
    <line x1="86" y1="56" x2="89" y2="62" stroke="#475569" strokeWidth="1.8" />
    <circle cx="14" cy="56" r="1.6" fill="#0F172A" />
    <circle cx="86" cy="56" r="1.6" fill="#0F172A" />

    
    <path d="M17 56 C26 66 74 66 83 56 C74 53 58 50 50 50 C42 50 26 53 17 56 Z" fill="url(#lower-lip-shade)" stroke="#1E293B" strokeWidth="1.8" />

    
    <ellipse cx="42" cy="55" rx="5" ry="2" fill="#FFFFFF" opacity="0.75" />
    <ellipse cx="58" cy="55" rx="5" ry="2" fill="#FFFFFF" opacity="0.75" />

    
    <path d="M36 69 C44 72 56 72 64 69" stroke="#64748B" strokeWidth="1.6" fill="none" />
  
  </g>

        </svg>
      );

    case "other_ears":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M38 18 C58 14 74 26 74 46 C74 64 64 78 52 82 C44 85 36 80 36 74 C36 68 44 64 48 58" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.4" />
    
    <path d="M48 28 C58 32 62 42 62 52 C62 62 54 70 46 72" stroke="#64748B" strokeWidth="1.8" fill="none" />
    <path d="M42 42 C48 42 52 46 52 52 C52 58 46 62 40 62" stroke="#1E293B" strokeWidth="1.8" fill="#E2E8F0" />
    
    <path d="M34 48 C38 48 40 52 38 56" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    
    <path d="M46 72 C48 76 46 80 42 81" stroke="#94A3B8" strokeWidth="1.4" fill="none" />
  
  </g>

        </svg>
      );

    case "other_hairline_high":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M26 40 C26 22 36 14 50 14 C64 14 74 22 74 40 L74 66 C74 78 64 84 50 84 C36 84 26 78 26 66 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 3" />
    
    <path d="M27 34 C36 34 38 22 50 22 C62 22 64 34 73 34" stroke="#1E293B" strokeWidth="2.4" fill="none" />
    
    <path d="M27 34 C25 20 35 12 50 12 C65 12 75 20 73 34" stroke="#0F172A" strokeWidth="1.8" fill="#CBD5E1" opacity="0.6" />
    
    <line x1="32" y1="58" x2="68" y2="58" stroke="#64748B" strokeWidth="1.2" />
    <line x1="50" y1="24" x2="50" y2="56" stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="2 2" />
  
  </g>

        </svg>
      );

    case "other_hairline_low":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    <path d="M26 40 C26 22 36 14 50 14 C64 14 74 22 74 40 L74 66 C74 78 64 84 50 84 C36 84 26 78 26 66 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 3" />
    
    <path d="M27 48 C38 46 44 42 50 42 C56 42 62 46 73 48" stroke="#1E293B" strokeWidth="2.4" fill="none" />
    
    <path d="M27 48 C25 20 35 12 50 12 C65 12 75 20 73 48 Z" fill="#CBD5E1" opacity="0.6" stroke="#0F172A" strokeWidth="1.8" />
    
    <line x1="32" y1="58" x2="68" y2="58" stroke="#64748B" strokeWidth="1.2" />
  
  </g>

        </svg>
      );

    case "hair_short":
    case "other_hair_short":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 42 C28 26 38 18 50 18 C62 18 72 26 72 42 L72 68 C72 78 62 82 50 82 C38 82 28 78 28 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" />
            <path d="M25 46 L25 36 C23 23 34 13 50 13 C66 13 77 23 75 36 L75 46 C73 40 71 34 68 32 C58 30 54 28 50 28 C46 28 42 30 32 32 C29 34 27 40 25 46 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <path d="M33 24 C40 20 46 20 52 22" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
            <path d="M47 18 C55 17 62 19 66 23" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          </g>
        </svg>
      );

    case "hair_side_part":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 42 C28 26 38 18 50 18 C62 18 72 26 72 42 L72 68 C72 78 62 82 50 82 C38 82 28 78 28 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" />
            <path d="M25 46 L25 36 C24 23 35 12 51 12 C67 12 77 23 75 36 L75 46 C72 40 70 34 65 31 C56 28 48 31 38 31 C33 31 29 36 25 46 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <line x1="38" y1="14" x2="36" y2="31" stroke="#FAFAFA" strokeWidth="1.5" />
            <path d="M41 18 C50 16 60 18 67 24" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
            <path d="M42 24 C50 22 58 24 64 28" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
            <path d="M35 22 C32 24 28 28 26 34" stroke="#94A3B8" strokeWidth="1.1" fill="none" />
          </g>
        </svg>
      );

    case "hair_buzz":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 42 C28 26 38 18 50 18 C62 18 72 26 72 42 L72 68 C72 78 62 82 50 82 C38 82 28 78 28 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" />
            <path d="M27 44 L27 37 C26 25 36 16 50 16 C64 16 74 25 73 37 L73 44 C71 39 70 33 65 30 C56 26 44 26 35 30 C30 33 29 39 27 44 Z" fill="#475569" stroke="#1E293B" strokeWidth="1.8" />
            <circle cx="42" cy="22" r="0.8" fill="#CBD5E1" />
            <circle cx="50" cy="20" r="0.8" fill="#CBD5E1" />
            <circle cx="58" cy="22" r="0.8" fill="#CBD5E1" />
            <circle cx="36" cy="28" r="0.8" fill="#CBD5E1" />
            <circle cx="64" cy="28" r="0.8" fill="#CBD5E1" />
          </g>
        </svg>
      );

    case "hair_wavy":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 42 C28 26 38 18 50 18 C62 18 72 26 72 42 L72 68 C72 78 62 82 50 82 C38 82 28 78 28 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" />
            <path d="M24 46 C22 38 23 30 28 23 C33 16 41 11 50 11 C59 11 67 16 72 23 C77 30 78 38 76 46 C73 40 70 33 65 31 C60 35 55 31 50 33 C45 31 40 35 35 31 C30 33 27 40 24 46 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <path d="M34 20 C38 16 44 22 48 18" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
            <path d="M52 18 C56 22 62 16 66 20" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
            <path d="M30 28 C36 24 40 28 46 25" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
            <path d="M54 25 C60 28 64 24 70 28" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          </g>
        </svg>
      );

    case "hair_fade":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 42 C28 26 38 18 50 18 C62 18 72 26 72 42 L72 68 C72 78 62 82 50 82 C38 82 28 78 28 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" />
            <path d="M26 44 C26 36 29 32 32 28 L68 28 C71 32 74 36 74 44 C72 40 70 38 67 36 L33 36 C30 38 28 40 26 44 Z" fill="#64748B" opacity="0.4" />
            <path d="M30 29 C32 18 38 10 50 10 C62 10 68 18 70 29 C64 26 58 24 50 25 C42 24 36 26 30 29 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <path d="M42 22 C44 15 48 14 50 18" stroke="#CBD5E1" strokeWidth="1.2" fill="none" />
            <path d="M52 18 C54 14 58 15 60 22" stroke="#CBD5E1" strokeWidth="1.2" fill="none" />
          </g>
        </svg>
      );

    case "hair_medium":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 42 C28 26 38 18 50 18 C62 18 72 26 72 42 L72 68 C72 78 62 82 50 82 C38 82 28 78 28 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" />
            <path d="M24 58 C22 46 24 32 30 22 C36 12 43 11 50 11 C57 11 64 12 70 22 C76 32 78 46 76 58 C72 50 72 38 67 34 C60 30 55 36 50 34 C45 36 40 30 33 34 C28 38 28 50 24 58 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <path d="M26 50 C28 44 32 38 38 35" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
            <path d="M74 50 C72 44 68 38 62 35" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
            <path d="M38 24 C44 20 50 21 56 25" stroke="#CBD5E1" strokeWidth="1.2" fill="none" />
          </g>
        </svg>
      );

    case "hair_long":
    case "other_hair_long":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 42 C28 26 38 18 50 18 C62 18 72 26 72 42 L72 68 C72 78 62 82 50 82 C38 82 28 78 28 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" />
            <path d="M22 82 C18 64 20 38 27 26 C33 14 41 12 50 12 C59 12 67 14 73 26 C80 38 82 64 78 82 C71 68 73 48 70 38 C62 33 56 31 50 31 C44 31 38 33 30 38 C27 48 29 68 22 82 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <path d="M24 54 C23 64 26 76 28 82" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
            <path d="M76 54 C77 64 74 76 72 82" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
            <path d="M49 14 L48 31" stroke="#FAFAFA" strokeWidth="1.2" strokeDasharray="2 2" />
          </g>
        </svg>
      );

    case "hair_afro":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 42 C28 26 38 18 50 18 C62 18 72 26 72 42 L72 68 C72 78 62 82 50 82 C38 82 28 78 28 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" />
            <path d="M20 48 C16 38 18 24 28 16 C38 8 62 8 72 16 C82 24 84 38 80 48 C76 42 74 36 70 34 C62 30 56 28 50 28 C44 28 38 30 30 34 C26 36 24 42 20 48 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <circle cx="34" cy="18" r="1.5" stroke="#94A3B8" strokeWidth="1.0" fill="none" />
            <circle cx="50" cy="14" r="1.5" stroke="#94A3B8" strokeWidth="1.0" fill="none" />
            <circle cx="66" cy="18" r="1.5" stroke="#94A3B8" strokeWidth="1.0" fill="none" />
            <circle cx="26" cy="30" r="1.5" stroke="#94A3B8" strokeWidth="1.0" fill="none" />
            <circle cx="74" cy="30" r="1.5" stroke="#94A3B8" strokeWidth="1.0" fill="none" />
          </g>
        </svg>
      );

    case "hair_slicked":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 42 C28 26 38 18 50 18 C62 18 72 26 72 42 L72 68 C72 78 62 82 50 82 C38 82 28 78 28 68 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.0" strokeDasharray="2 2" />
            <path d="M26 44 L26 36 C24 22 36 9 50 9 C64 9 76 22 74 36 L74 44 C72 38 68 32 64 28 C56 24 44 24 36 28 C32 32 28 38 26 44 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <path d="M42 26 C43 18 45 14 47 12" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
            <path d="M50 25 C50 17 50 13 50 11" stroke="#CBD5E1" strokeWidth="1.3" fill="none" />
            <path d="M58 26 C57 18 55 14 53 12" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
          </g>
        </svg>
      );

    case "hair_bald":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M26 44 C26 26 36 14 50 14 C64 14 74 26 74 44 L74 68 C74 78 64 82 50 82 C36 82 26 78 26 68 Z" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.0" />
            <path d="M38 22 C42 18 48 17 52 17" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
            <path d="M27 40 C28 34 31 28 35 24" stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" fill="none" />
            <path d="M73 40 C72 34 69 28 65 24" stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="1.5 2" fill="none" />
          </g>
        </svg>
      );

    case "other_scar":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
            </linearGradient>
            <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M26 34 C36 44 48 50 64 54" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
            <path d="M30 42 Q48 52 68 46" stroke="#1E293B" strokeWidth="2.2" fill="none" />
            <line x1="36" y1="41" x2="38" y2="49" stroke="#475569" strokeWidth="1.5" />
            <line x1="45" y1="44" x2="47" y2="52" stroke="#475569" strokeWidth="1.5" />
            <line x1="54" y1="45" x2="56" y2="53" stroke="#475569" strokeWidth="1.5" />
            <line x1="62" y1="44" x2="64" y2="51" stroke="#475569" strokeWidth="1.5" />
            <path d="M32 40 Q48 50 66 44" stroke="#94A3B8" strokeWidth="1.0" fill="none" />
          </g>
        </svg>
      );

    case "beard_full":
    case "other_beard":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 36 L22 62 C22 75 34 84 50 84 C66 84 78 75 78 62 L78 36 C74 44 68 50 62 53 C55 56 45 56 38 53 C32 50 26 44 22 36 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <ellipse cx="50" cy="58" rx="12" ry="5.5" fill="#FAFAFA" stroke="#1E293B" strokeWidth="1.3" />
            <path d="M38 51 C44 48 48 51 50 51 C52 51 56 48 62 51 C58 55 54 55 50 54 C46 55 42 55 38 51 Z" fill="#1E293B" />
            <line x1="32" y1="64" x2="38" y2="72" stroke="#94A3B8" strokeWidth="1.2" />
            <line x1="45" y1="70" x2="48" y2="78" stroke="#94A3B8" strokeWidth="1.2" />
            <line x1="55" y1="70" x2="52" y2="78" stroke="#94A3B8" strokeWidth="1.2" />
            <line x1="68" y1="64" x2="62" y2="72" stroke="#94A3B8" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case "beard_goatee":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M36 50 C36 44 42 42 50 42 C58 42 64 44 64 50 C65 58 64 68 62 76 C58 82 54 84 50 84 C46 84 42 82 38 76 C36 68 35 58 36 50 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <ellipse cx="50" cy="56" rx="9" ry="4.5" fill="#FAFAFA" stroke="#1E293B" strokeWidth="1.3" />
            <line x1="46" y1="68" x2="48" y2="78" stroke="#94A3B8" strokeWidth="1.2" />
            <line x1="54" y1="68" x2="52" y2="78" stroke="#94A3B8" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case "beard_stubble":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 36 L22 62 C22 75 34 84 50 84 C66 84 78 75 78 62 L78 36 C74 44 68 50 62 53 C55 56 45 56 38 53 C32 50 26 44 22 36 Z" fill="#64748B" opacity="0.35" />
            <ellipse cx="50" cy="58" rx="12" ry="5.5" fill="#FAFAFA" stroke="#94A3B8" strokeWidth="1.0" />
            <circle cx="30" cy="52" r="0.9" fill="#334155" />
            <circle cx="38" cy="62" r="0.9" fill="#334155" />
            <circle cx="44" cy="72" r="0.9" fill="#334155" />
            <circle cx="50" cy="74" r="0.9" fill="#334155" />
            <circle cx="56" cy="72" r="0.9" fill="#334155" />
            <circle cx="62" cy="62" r="0.9" fill="#334155" />
            <circle cx="70" cy="52" r="0.9" fill="#334155" />
          </g>
        </svg>
      );

    case "beard_chinstrap":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 36 L22 62 C22 75 34 84 50 84 C66 84 78 75 78 62 L78 36 L72 36 L72 60 C72 70 62 78 50 78 C38 78 28 70 28 60 L28 36 Z" fill="#334155" stroke="#0F172A" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case "beard_vandyke":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M38 52 C44 48 48 51 50 51 C52 51 56 48 62 52 C58 56 54 56 50 54 C46 56 42 56 38 52 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
            <path d="M42 62 L58 62 C58 72 54 82 50 86 C46 82 42 72 42 62 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
            <line x1="48" y1="66" x2="49" y2="78" stroke="#94A3B8" strokeWidth="1.2" />
            <line x1="52" y1="66" x2="51" y2="78" stroke="#94A3B8" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case "other_mole":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M26 36 C38 48 58 54 74 52" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
    
    <circle cx="51" cy="51" r="7.5" fill="#CBD5E1" opacity="0.6" />
    
    <circle cx="50" cy="50" r="7" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
    
    <path d="M45 46 C47 44 51 44 53 45" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
  
  </g>

        </svg>
      );

    case "other_beard":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M20 38 L20 60 C20 74 34 82 50 82 C66 82 80 74 80 60 L80 38 C76 44 72 50 66 54 C58 58 42 58 34 54 C28 50 24 44 20 38 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.2" />
    
    <ellipse cx="50" cy="56" rx="12" ry="5" fill="#FAFAFA" stroke="#1E293B" strokeWidth="1.4" />
    
    <line x1="28" y1="62" x2="34" y2="68" stroke="#64748B" strokeWidth="1.2" />
    <line x1="44" y1="68" x2="48" y2="76" stroke="#64748B" strokeWidth="1.2" />
    <line x1="56" y1="68" x2="52" y2="76" stroke="#64748B" strokeWidth="1.2" />
    <line x1="72" y1="62" x2="66" y2="68" stroke="#64748B" strokeWidth="1.2" />
  
  </g>

        </svg>
      );

    case "other_moustache":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">

  <defs>
    <linearGradient id="graphite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9"/>
      <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="shadow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.1"/>
    </linearGradient>
    <radialGradient id="iris-grad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#64748B"/>
      <stop offset="50%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0F172A"/>
    </radialGradient>
    
  </defs>

  
  <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
  
  
  <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
    
    
    
    <path d="M20 60 C32 58 44 60 50 60 C56 60 68 58 80 60" stroke="#CBD5E1" strokeWidth="1.2" fill="none" />
    
    <path d="M18 56 C26 48 40 44 50 48 C60 44 74 48 82 56 C74 58 60 58 50 54 C40 58 26 58 18 56 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.0" />
    
    <path d="M24 54 C32 52 40 50 46 51" stroke="#64748B" strokeWidth="1.2" fill="none" />
    <path d="M76 54 C68 52 60 50 54 51" stroke="#64748B" strokeWidth="1.2" fill="none" />
    <line x1="50" y1="48" x2="50" y2="54" stroke="#0F172A" strokeWidth="1.4" />
  
  </g>

        </svg>
      );


    case "ear_regular":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 22 C56 22 66 32 66 45 C66 60 60 72 52 76 C46 79 38 76 38 70 C38 66 41 62 44 60" fill="none" stroke="#1E293B" strokeWidth="2.2" />
            <path d="M50 32 C56 38 56 50 50 58 C46 62 42 63 39 63" fill="none" stroke="#64748B" strokeWidth="1.6" />
            <path d="M38 46 C41 46 43 49 41 53 C40 55 37 56 36 54" fill="none" stroke="#1E293B" strokeWidth="1.8" />
            <path d="M54 36 C58 42 58 52 54 58" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
          </g>
        </svg>
      );

    case "ear_attached":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 22 C56 22 65 32 65 45 C65 58 58 68 46 73 C42 75 36 76 34 76" fill="none" stroke="#1E293B" strokeWidth="2.2" />
            <path d="M49 32 C55 38 55 50 49 57 C45 61 40 63 36 63" fill="none" stroke="#64748B" strokeWidth="1.6" />
            <path d="M36 46 C39 46 41 49 39 53 C38 55 35 55 34 54" fill="none" stroke="#1E293B" strokeWidth="1.8" />
            <path d="M34 68 C34 74 34 80 34 84" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="1.5 2" fill="none" />
          </g>
        </svg>
      );

    case "ear_free":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 20 C56 20 66 30 66 44 C66 58 62 70 54 78 C48 83 38 82 36 74 C35 68 40 64 44 62" fill="none" stroke="#1E293B" strokeWidth="2.2" />
            <path d="M36 70 C39 70 41 68 43 64" fill="none" stroke="#64748B" strokeWidth="1.4" />
            <path d="M50 30 C56 36 56 48 50 56 C46 60 42 61 38 61" fill="none" stroke="#64748B" strokeWidth="1.6" />
            <path d="M37 45 C40 45 42 48 40 52 C39 54 36 55 35 53" fill="none" stroke="#1E293B" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case "ear_protruding":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M38 20 C56 18 72 28 72 45 C72 62 64 74 54 78 C46 81 38 78 38 70 C38 65 41 62 44 60" fill="none" stroke="#1E293B" strokeWidth="2.2" />
            <path d="M52 28 C62 36 62 52 54 62" stroke="#94A3B8" strokeWidth="1.3" strokeDasharray="1.5 2" fill="none" />
            <path d="M47 30 C53 36 53 48 47 56 C43 60 39 61 36 61" fill="none" stroke="#64748B" strokeWidth="1.6" />
            <path d="M35 44 C38 44 40 47 38 51 C37 53 34 54 33 52" fill="none" stroke="#1E293B" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case "ear_pointed":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 22 C52 20 62 26 67 32 C69 34 68 38 66 45 C65 60 59 71 51 75 C45 78 38 75 38 69 C38 65 41 62 44 60" fill="none" stroke="#1E293B" strokeWidth="2.2" />
            <path d="M64 30 L67 33 L64 37" fill="none" stroke="#64748B" strokeWidth="1.5" />
            <path d="M49 32 C54 37 54 49 48 57 C44 61 40 62 37 62" fill="none" stroke="#64748B" strokeWidth="1.6" />
            <path d="M37 45 C40 45 42 48 40 52 C39 54 36 55 35 53" fill="none" stroke="#1E293B" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case "ear_narrow":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M44 20 C53 20 60 28 60 42 C60 58 56 68 49 74 C45 77 39 75 39 70 C39 66 41 62 44 60" fill="none" stroke="#1E293B" strokeWidth="2.2" />
            <path d="M49 30 C53 36 53 48 48 56 C45 60 42 61 39 61" fill="none" stroke="#64748B" strokeWidth="1.6" />
            <path d="M38 45 C40 45 42 47 41 51 C40 53 37 54 36 52" fill="none" stroke="#1E293B" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case "neck_standard":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M40 32 C45 35 55 35 60 32" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
            <path d="M34 32 C34 46 32 60 26 70 C22 76 16 80 12 82" fill="none" stroke="#1E293B" strokeWidth="2.2" />
            <path d="M66 32 C66 46 68 60 74 70 C78 76 84 80 88 82" fill="none" stroke="#1E293B" strokeWidth="2.2" />
            <path d="M44 76 C47 78 53 78 56 76" stroke="#64748B" strokeWidth="1.6" fill="none" />
            <path d="M36 78 C28 77 22 79 16 82" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
            <path d="M64 78 C72 77 78 79 84 82" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          </g>
        </svg>
      );

    case "neck_thick":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M40 32 C45 35 55 35 60 32" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
            <path d="M28 32 C28 44 26 58 20 68 C16 74 12 78 8 80" fill="none" stroke="#1E293B" strokeWidth="2.4" />
            <path d="M72 32 C72 44 74 58 80 68 C84 74 88 78 92 80" fill="none" stroke="#1E293B" strokeWidth="2.4" />
            <path d="M34 38 C38 52 44 68 47 74" stroke="#64748B" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
            <path d="M66 38 C62 52 56 68 53 74" stroke="#64748B" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
            <path d="M45 76 C47 78 53 78 55 76" stroke="#1E293B" strokeWidth="1.8" fill="none" />
          </g>
        </svg>
      );

    case "neck_slender":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 32 C46 34 54 34 58 32" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
            <path d="M38 32 C38 48 37 62 30 72 C26 78 18 82 14 84" fill="none" stroke="#1E293B" strokeWidth="2.0" />
            <path d="M62 32 C62 48 63 62 70 72 C74 78 82 82 86 84" fill="none" stroke="#1E293B" strokeWidth="2.0" />
            <path d="M38 78 C32 77 24 79 16 84" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
            <path d="M62 78 C68 77 76 79 84 84" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          </g>
        </svg>
      );

    case "neck_wide":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M38 32 C44 36 56 36 62 32" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
            <path d="M26 32 C26 44 24 58 18 68 C14 74 10 77 6 78" fill="none" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M74 32 C74 44 76 58 82 68 C86 74 90 77 94 78" fill="none" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M28 42 C28 54 26 66 22 72" stroke="#94A3B8" strokeWidth="1.3" strokeDasharray="1.5 2" fill="none" />
            <path d="M72 42 C72 54 74 66 78 72" stroke="#94A3B8" strokeWidth="1.3" strokeDasharray="1.5 2" fill="none" />
          </g>
        </svg>
      );

    case "neck_long":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 26 C46 28 54 28 58 26" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
            <path d="M36 26 C36 44 35 64 30 76 C26 82 20 86 16 88" fill="none" stroke="#1E293B" strokeWidth="2.1" />
            <path d="M64 26 C64 44 65 64 70 76 C74 82 80 86 84 88" fill="none" stroke="#1E293B" strokeWidth="2.1" />
            <path d="M47 48 C49 50 51 50 53 48" stroke="#64748B" strokeWidth="1.6" fill="none" />
            <line x1="50" y1="52" x2="50" y2="78" stroke="#94A3B8" strokeWidth="1.1" strokeDasharray="1.5 2" />
          </g>
        </svg>
      );

    case "neck_short":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <path d="M40 36 C45 40 55 40 60 36" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
            <path d="M32 36 C30 46 24 56 16 66 C12 72 8 76 4 78" fill="none" stroke="#1E293B" strokeWidth="2.3" />
            <path d="M68 36 C70 46 76 56 84 66 C88 72 92 76 96 78" fill="none" stroke="#1E293B" strokeWidth="2.3" />
            <path d="M38 72 C30 72 20 74 14 78" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
            <path d="M62 72 C70 72 80 74 86 78" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
          </g>
        </svg>
      );


    case "cheeks_high_prominent":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-cheeks_high_prominent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M50 18 C32 18 25 32 25 50 C25 68 34 80 50 84 C66 80 75 68 75 50 C75 32 68 18 50 18 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
    <path d="M28 46 C34 38 42 42 46 48" stroke="#1E293B" strokeWidth="2.2" fill="none" />
    <path d="M72 46 C66 38 58 42 54 48" stroke="#1E293B" strokeWidth="2.2" fill="none" />
    <path d="M30 49 L36 55 M34 47 L40 53 M38 45 L44 51" stroke="#94A3B8" strokeWidth="1.0" />
    <path d="M70 49 L64 55 M66 47 L60 53 M62 45 L56 51" stroke="#94A3B8" strokeWidth="1.0" />
          </g>
        </svg>
      );

    case "cheeks_gaunt_hollow":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-cheeks_gaunt_hollow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M50 18 C32 18 25 32 25 50 C25 68 34 80 50 84 C66 80 75 68 75 50 C75 32 68 18 50 18 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
    <path d="M27 44 C34 41 40 44 44 48" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    <path d="M73 44 C66 41 60 44 56 48" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    
    <path d="M32 50 C30 58 33 66 38 70" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    <path d="M68 50 C70 58 67 66 62 70" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    <line x1="31" y1="56" x2="36" y2="58" stroke="#64748B" strokeWidth="1.0" />
    <line x1="33" y1="62" x2="38" y2="64" stroke="#64748B" strokeWidth="1.0" />
    <line x1="69" y1="56" x2="64" y2="58" stroke="#64748B" strokeWidth="1.0" />
    <line x1="67" y1="62" x2="62" y2="64" stroke="#64748B" strokeWidth="1.0" />
          </g>
        </svg>
      );

    case "cheeks_full_buccal":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-cheeks_full_buccal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M50 18 C30 18 22 34 22 52 C22 72 32 84 50 86 C68 84 78 72 78 52 C78 34 70 18 50 18 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
    <path d="M24 50 C23 62 31 72 40 76" stroke="#1E293B" strokeWidth="2.2" fill="none" />
    <path d="M76 50 C77 62 69 72 60 76" stroke="#1E293B" strokeWidth="2.2" fill="none" />
    <path d="M32 54 C36 62 42 66 46 68" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
    <path d="M68 54 C64 62 58 66 54 68" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
          </g>
        </svg>
      );

    case "cheeks_dimples":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-cheeks_dimples" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M50 18 C32 18 25 32 25 50 C25 68 34 80 50 84 C66 80 75 68 75 50 C75 32 68 18 50 18 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="2 2" />
    
    <path d="M42 62 C46 64 54 64 58 62" stroke="#94A3B8" strokeWidth="1.3" fill="none" />
    
    <path d="M34 57 C33 60 33 64 35 67" stroke="#1E293B" strokeWidth="2.4" fill="none" />
    <circle cx="34" cy="62" r="1.4" fill="#1E293B" />
    <path d="M66 57 C67 60 67 64 65 67" stroke="#1E293B" strokeWidth="2.4" fill="none" />
    <circle cx="66" cy="62" r="1.4" fill="#1E293B" />
          </g>
        </svg>
      );

    case "age_forehead_furrows":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-age_forehead_furrows" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M28 22 C34 18 66 18 72 22" stroke="#94A3B8" strokeWidth="1.0" strokeDasharray="2 2" fill="none" />
    <path d="M30 30 C38 28 62 28 70 30" stroke="#1E293B" strokeWidth="1.9" fill="none" />
    <path d="M33 36 C42 34 58 34 67 36" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M37 42 C44 40 56 40 63 42" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    
    <path d="M40 33 L43 33" stroke="#64748B" strokeWidth="1.2" />
    <path d="M57 39 L60 39" stroke="#64748B" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case "age_glabellar_lines":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-age_glabellar_lines" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    
    <path d="M28 42 C34 38 44 40 47 43" stroke="#94A3B8" strokeWidth="1.4" fill="none" />
    <path d="M72 42 C66 38 56 40 53 43" stroke="#94A3B8" strokeWidth="1.4" fill="none" />
    
    <path d="M47 34 C46 42 47 49 48 54" stroke="#1E293B" strokeWidth="2.3" fill="none" />
    <path d="M53 34 C54 42 53 49 52 54" stroke="#1E293B" strokeWidth="2.3" fill="none" />
    
    <path d="M46 51 C48 53 52 53 54 51" stroke="#64748B" strokeWidth="1.3" fill="none" />
          </g>
        </svg>
      );

    case "age_crows_feet":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-age_crows_feet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    
    <path d="M32 50 C38 45 46 45 52 50 C46 54 38 54 32 50 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
    
    <path d="M29 45 L19 40" stroke="#1E293B" strokeWidth="1.8" />
    <path d="M28 49 L17 48" stroke="#1E293B" strokeWidth="2.1" />
    <path d="M29 53 L18 57" stroke="#1E293B" strokeWidth="1.9" />
    <path d="M31 56 L22 62" stroke="#64748B" strokeWidth="1.4" />
    
    <path d="M68 50 C74 45 82 45 88 50" stroke="#94A3B8" strokeWidth="1.0" fill="none" />
    <path d="M89 48 L97 47" stroke="#1E293B" strokeWidth="1.8" />
    <path d="M88 52 L96 56" stroke="#1E293B" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case "age_nasolabial_folds":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-age_nasolabial_folds" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    
    <path d="M44 42 C47 44 53 44 56 42" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
    
    <path d="M42 66 C46 64 54 64 58 66" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
    
    <path d="M41 46 C37 54 35 64 39 74" stroke="#1E293B" strokeWidth="2.4" fill="none" />
    <path d="M59 46 C63 54 65 64 61 74" stroke="#1E293B" strokeWidth="2.4" fill="none" />
    <path d="M43 54 C40 60 39 66 42 71" stroke="#94A3B8" strokeWidth="1.0" fill="none" />
    <path d="M57 54 C60 60 61 66 58 71" stroke="#94A3B8" strokeWidth="1.0" fill="none" />
          </g>
        </svg>
      );

    case "age_marionette_lines":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-age_marionette_lines" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    
    <path d="M38 56 C44 54 56 54 62 56" stroke="#94A3B8" strokeWidth="1.4" fill="none" />
    
    <path d="M39 58 C37 66 38 74 42 80" stroke="#1E293B" strokeWidth="2.3" fill="none" />
    <path d="M61 58 C63 66 62 74 58 80" stroke="#1E293B" strokeWidth="2.3" fill="none" />
    
    <path d="M44 72 C47 74 53 74 56 72" stroke="#64748B" strokeWidth="1.5" fill="none" />
    
    <path d="M30 68 C34 76 40 82 50 83 C60 82 66 76 70 68" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
          </g>
        </svg>
      );

    case "mouth_teeth_parted":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mouth_teeth_parted" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M30 45 C38 41 46 41 50 43 C54 41 62 41 70 45 C64 47 50 49 30 45 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
    
    <path d="M33 46 C42 49 58 49 67 46 C64 56 36 56 33 46 Z" fill="#0F172A" />
    
    <rect x="44" y="46" width="6" height="6.5" rx="0.8" fill="#FFFFFF" stroke="#334155" strokeWidth="0.8" />
    <rect x="50" y="46" width="6" height="6.5" rx="0.8" fill="#FFFFFF" stroke="#334155" strokeWidth="0.8" />
    
    <rect x="39" y="46.5" width="5" height="5.5" rx="0.6" fill="#F1F5F9" stroke="#475569" strokeWidth="0.7" />
    <rect x="56" y="46.5" width="5" height="5.5" rx="0.6" fill="#F1F5F9" stroke="#475569" strokeWidth="0.7" />
    
    <path d="M33 54 C42 63 58 63 67 54 C60 62 40 62 33 54 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case "mouth_diastema":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mouth_diastema" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M30 45 C38 41 46 41 50 43 C54 41 62 41 70 45 C64 47 50 49 30 45 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
    <path d="M33 46 C42 49 58 49 67 46 C64 56 36 56 33 46 Z" fill="#0F172A" />
    
    <rect x="43" y="46" width="5.5" height="6.5" rx="0.8" fill="#FFFFFF" stroke="#334155" strokeWidth="0.8" />
    <rect x="51.5" y="46" width="5.5" height="6.5" rx="0.8" fill="#FFFFFF" stroke="#334155" strokeWidth="0.8" />
    <line x1="50" y1="46" x2="50" y2="53" stroke="#0F172A" strokeWidth="1.6" />
    
    <path d="M33 54 C42 63 58 63 67 54 C60 62 40 62 33 54 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case "mouth_crooked_teeth":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mouth_crooked_teeth" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M30 45 C38 41 46 41 50 43 C54 41 62 41 70 45 C64 47 50 49 30 45 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
    <path d="M33 46 C42 49 58 49 67 46 C64 56 36 56 33 46 Z" fill="#0F172A" />
    <polygon points="43,46 49,46.5 48.5,53 42.5,52.5" fill="#FFFFFF" stroke="#334155" strokeWidth="0.8" />
    <polygon points="48,45.8 55,46.2 54.5,53 48,52.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.0" />
    
    <path d="M33 54 C42 63 58 63 67 54 C60 62 40 62 33 54 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case "mouth_gold_tooth":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mouth_gold_tooth" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M30 45 C38 41 46 41 50 43 C54 41 62 41 70 45 C64 47 50 49 30 45 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
    <path d="M33 46 C42 49 58 49 67 46 C64 56 36 56 33 46 Z" fill="#0F172A" />
    <rect x="44" y="46" width="6" height="6.5" rx="0.8" fill="#FFFFFF" stroke="#334155" strokeWidth="0.8" />
    <rect x="50" y="46" width="6" height="6.5" rx="0.8" fill="url(#gold-grad-mouth_gold_tooth)" stroke="#854D0E" strokeWidth="1.0" />
    <polygon points="52,47 54,47 51,51" fill="#FEF08A" opacity="0.8" />
    
    <path d="M33 54 C42 63 58 63 67 54 C60 62 40 62 33 54 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case "glasses_wire_rim":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-glasses_wire_rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M12 47 L22 47" stroke="#475569" strokeWidth="1.3" />
    <path d="M78 47 L88 47" stroke="#475569" strokeWidth="1.3" />
    <ellipse cx="35" cy="48" rx="14" ry="11" fill="#F8FAFC" fillOpacity="0.4" stroke="#334155" strokeWidth="1.6" />
    <ellipse cx="65" cy="48" rx="14" ry="11" fill="#F8FAFC" fillOpacity="0.4" stroke="#334155" strokeWidth="1.6" />
    <path d="M49 46 C50 43 50 43 51 46" stroke="#334155" strokeWidth="1.6" fill="none" />
    <line x1="28" y1="41" x2="33" y2="44" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="58" y1="41" x2="63" y2="44" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "glasses_rectangular":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-glasses_rectangular" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M10 44 L20 46" stroke="#1E293B" strokeWidth="2.2" />
    <path d="M80 46 L90 44" stroke="#1E293B" strokeWidth="2.2" />
    <rect x="20" y="38" width="28" height="18" rx="3" fill="#F8FAFC" fillOpacity="0.3" stroke="#0F172A" strokeWidth="2.4" />
    <rect x="52" y="38" width="28" height="18" rx="3" fill="#F8FAFC" fillOpacity="0.3" stroke="#0F172A" strokeWidth="2.4" />
    <path d="M48 44 L52 44" stroke="#0F172A" strokeWidth="2.6" />
    <line x1="24" y1="42" x2="30" y2="42" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="56" y1="42" x2="62" y2="42" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "glasses_horn_rim":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-glasses_horn_rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M8 43 L18 45" stroke="#0F172A" strokeWidth="3.2" />
    <path d="M82 45 L92 43" stroke="#0F172A" strokeWidth="3.2" />
    <rect x="18" y="36" width="30" height="22" rx="5" fill="#F8FAFC" fillOpacity="0.2" stroke="#0F172A" strokeWidth="3.6" />
    <rect x="52" y="36" width="30" height="22" rx="5" fill="#F8FAFC" fillOpacity="0.2" stroke="#0F172A" strokeWidth="3.6" />
    <path d="M48 43 C49 39 51 39 52 43" stroke="#0F172A" strokeWidth="3.6" fill="none" />
    <circle cx="21" cy="39" r="1.0" fill="#CBD5E1" />
    <circle cx="79" cy="39" r="1.0" fill="#CBD5E1" />
          </g>
        </svg>
      );

    case "glasses_aviator":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-glasses_aviator" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M10 44 L20 44" stroke="#334155" strokeWidth="1.5" />
    <path d="M80 44 L90 44" stroke="#334155" strokeWidth="1.5" />
    <path d="M20 38 C30 38 48 38 48 46 C48 55 36 60 28 58 C21 56 19 48 20 38 Z" fill="#F8FAFC" fillOpacity="0.3" stroke="#334155" strokeWidth="1.8" />
    <path d="M80 38 C70 38 52 38 52 46 C52 55 64 60 72 58 C79 56 81 48 80 38 Z" fill="#F8FAFC" fillOpacity="0.3" stroke="#334155" strokeWidth="1.8" />
    <line x1="28" y1="36" x2="72" y2="36" stroke="#334155" strokeWidth="1.8" />
    <path d="M48 43 C49 41 51 41 52 43" stroke="#334155" strokeWidth="1.5" fill="none" />
          </g>
        </svg>
      );

    case "glasses_browline":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-glasses_browline" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M10 42 L18 43" stroke="#0F172A" strokeWidth="3.0" />
    <path d="M82 43 L90 42" stroke="#0F172A" strokeWidth="3.0" />
    <path d="M18 43 C26 39 42 39 48 43 L48 46 C40 43 24 43 18 47 Z" fill="#0F172A" />
    <path d="M82 43 C74 39 58 39 52 43 L52 46 C60 43 76 43 82 47 Z" fill="#0F172A" />
    <path d="M18 47 C18 57 32 60 48 56 L48 46" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M82 47 C82 57 68 60 52 56 L52 46" stroke="#475569" strokeWidth="1.5" fill="none" />
    <line x1="48" y1="44" x2="52" y2="44" stroke="#475569" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case "glasses_sunglasses":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-glasses_sunglasses" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M8 44 L18 45" stroke="#0F172A" strokeWidth="2.5" />
    <path d="M82 45 L92 44" stroke="#0F172A" strokeWidth="2.5" />
    <rect x="18" y="38" width="30" height="20" rx="4" fill="#0F172A" stroke="#1E293B" strokeWidth="2.2" />
    <rect x="52" y="38" width="30" height="20" rx="4" fill="#0F172A" stroke="#1E293B" strokeWidth="2.2" />
    <line x1="48" y1="44" x2="52" y2="44" stroke="#0F172A" strokeWidth="3.0" />
    <polygon points="22,39 27,39 20,56 19,56" fill="#FFFFFF" opacity="0.25" />
    <polygon points="56,39 61,39 54,56 53,56" fill="#FFFFFF" opacity="0.25" />
          </g>
        </svg>
      );

    case "headwear_baseball_front":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-headwear_baseball_front" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M22 45 C22 22 34 16 50 16 C66 16 78 22 78 45 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.0" />
    <path d="M50 16 L50 45" stroke="#475569" strokeWidth="1.2" />
    <path d="M36 21 C41 29 44 38 46 45" stroke="#475569" strokeWidth="1.0" fill="none" />
    <path d="M64 21 C59 29 56 38 54 45" stroke="#475569" strokeWidth="1.0" fill="none" />
    <ellipse cx="50" cy="16" rx="2.5" ry="1.5" fill="#CBD5E1" />
    <path d="M16 45 C26 53 74 53 84 45 C78 41 22 41 16 45 Z" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case "headwear_baseball_back":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-headwear_baseball_back" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M22 45 C22 22 34 16 50 16 C66 16 78 22 78 45 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.0" />
    <path d="M40 45 C40 34 60 34 60 45 Z" fill="#FAFAFA" stroke="#0F172A" strokeWidth="1.8" />
    <line x1="42" y1="42" x2="58" y2="42" stroke="#475569" strokeWidth="2.0" />
    <path d="M16 45 C18 42 22 42 24 45" stroke="#0F172A" strokeWidth="2.0" fill="none" />
    <path d="M76 45 C78 42 82 42 84 45" stroke="#0F172A" strokeWidth="2.0" fill="none" />
          </g>
        </svg>
      );

    case "headwear_beanie":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-headwear_beanie" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M24 48 C24 20 36 14 50 14 C64 14 76 20 76 48 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
    <line x1="36" y1="20" x2="36" y2="48" stroke="#475569" strokeWidth="1.2" />
    <line x1="43" y1="16" x2="43" y2="48" stroke="#475569" strokeWidth="1.2" />
    <line x1="50" y1="14" x2="50" y2="48" stroke="#475569" strokeWidth="1.2" />
    <line x1="57" y1="16" x2="57" y2="48" stroke="#475569" strokeWidth="1.2" />
    <line x1="64" y1="20" x2="64" y2="48" stroke="#475569" strokeWidth="1.2" />
    <rect x="22" y="46" width="56" height="12" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1.8" />
    <line x1="24" y1="52" x2="76" y2="52" stroke="#475569" strokeWidth="1.0" strokeDasharray="2 2" />
          </g>
        </svg>
      );

    case "headwear_hoodie":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-headwear_hoodie" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M18 78 C14 55 18 24 50 18 C82 24 86 55 82 78 C74 76 68 72 66 65 C68 40 64 30 50 30 C36 30 32 40 34 65 C32 72 26 76 18 78 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.2" />
    <ellipse cx="50" cy="48" rx="16" ry="20" fill="#FAFAFA" stroke="#1E293B" strokeWidth="1.8" strokeDasharray="2 2" />
    <path d="M34 65 C32 74 34 82 36 86" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M66 65 C68 74 66 82 64 86" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M38 72 L38 82" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M62 72 L62 82" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "headwear_flat_cap":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-headwear_flat_cap" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M16 48 C18 28 32 20 54 20 C74 20 84 28 86 42 C82 46 64 48 50 48 C36 48 20 48 16 48 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.0" />
    <line x1="50" y1="20" x2="48" y2="44" stroke="#475569" strokeWidth="1.2" />
    <path d="M36 24 C40 32 42 38 42 45" stroke="#475569" strokeWidth="1.0" fill="none" />
    <path d="M64 24 C60 32 58 38 58 45" stroke="#475569" strokeWidth="1.0" fill="none" />
    <path d="M18 48 C28 54 58 54 68 46 C54 44 26 44 18 48 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case "nose_broken":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-nose_broken" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M48 22 C48 30 43 38 45 48 C47 56 42 62 49 68" stroke="#1E293B" strokeWidth="2.4" fill="none" />
    <path d="M44 38 L49 39" stroke="#64748B" strokeWidth="1.4" />
    <path d="M36 65 C34 68 38 72 45 71" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M62 67 C64 70 60 73 53 72" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <ellipse cx="43" cy="69" rx="3.2" ry="1.8" fill="#1E293B" />
    <ellipse cx="55" cy="70" rx="2.6" ry="1.6" fill="#1E293B" />
          </g>
        </svg>
      );

    case "nose_aquiline":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-nose_aquiline" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M49 22 C49 28 46 34 45 42 C44 48 48 54 49 65" stroke="#1E293B" strokeWidth="2.4" fill="none" />
    <path d="M45 36 C42 42 44 48 48 52" stroke="#94A3B8" strokeWidth="1.6" strokeDasharray="1.5 1.5" fill="none" />
    <path d="M37 66 C35 70 41 73 50 72 C59 73 65 70 63 66" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <ellipse cx="44" cy="70" rx="3" ry="1.8" fill="#1E293B" />
    <ellipse cx="56" cy="70" rx="3" ry="1.8" fill="#1E293B" />
          </g>
        </svg>
      );

    case "nose_bulbous":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-nose_bulbous" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M48 24 C48 36 47 48 46 56" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M52 24 C52 36 53 48 54 56" stroke="#94A3B8" strokeWidth="1.4" fill="none" />
    <circle cx="50" cy="66" r="8" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2" />
    <path d="M34 65 C32 68 36 72 43 71" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <path d="M66 65 C68 68 64 72 57 71" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <ellipse cx="42" cy="70" rx="3" ry="1.8" fill="#1E293B" />
    <ellipse cx="58" cy="70" rx="3" ry="1.8" fill="#1E293B" />
          </g>
        </svg>
      );

    case "nose_hawk":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-nose_hawk" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M50 22 C50 32 46 44 45 52 C44 60 48 68 50 74" stroke="#1E293B" strokeWidth="2.5" fill="none" />
    <path d="M44 66 C48 72 50 76 50 77 C50 76 52 72 56 66" stroke="#1E293B" strokeWidth="2.2" fill="none" />
    <path d="M36 64 C35 67 39 70 44 68" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    <path d="M64 64 C65 67 61 70 56 68" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    <ellipse cx="44" cy="68" rx="2.6" ry="1.4" fill="#1E293B" />
    <ellipse cx="56" cy="68" rx="2.6" ry="1.4" fill="#1E293B" />
          </g>
        </svg>
      );

    case "nose_piercing":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-nose_piercing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M48 24 L48 58" stroke="#1E293B" strokeWidth="2.0" />
    <path d="M37 66 C35 70 41 73 50 72 C59 73 65 70 63 66" stroke="#1E293B" strokeWidth="2.0" fill="none" />
    <ellipse cx="44" cy="70" rx="3" ry="1.8" fill="#1E293B" />
    <ellipse cx="56" cy="70" rx="3" ry="1.8" fill="#1E293B" />
    <circle cx="63" cy="67" r="2.8" fill="#0F172A" />
    <circle cx="63" cy="67" r="2.2" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.8" />
    <circle cx="62.4" cy="66.4" r="0.7" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case "moustache_pencil":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-moustache_pencil" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M26 58 C34 56 46 56 50 57 C54 56 66 56 74 58 C66 57 54 57 50 58 C46 57 34 57 26 58 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
    <line x1="28" y1="58" x2="72" y2="58" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "moustache_handlebar":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-moustache_handlebar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M20 54 C24 50 40 48 50 51 C60 48 76 50 80 54 C84 58 84 66 78 68 C74 70 72 64 74 58 C66 54 58 53 50 54 C42 53 34 54 26 58 C28 64 26 70 22 68 C16 66 16 58 20 54 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.8" />
    <path d="M22 62 C21 58 24 54 30 52" stroke="#CBD5E1" strokeWidth="0.9" fill="none" />
    <path d="M78 62 C79 58 76 54 70 52" stroke="#CBD5E1" strokeWidth="0.9" fill="none" />
          </g>
        </svg>
      );

    case "moustache_chevron":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-moustache_chevron" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M22 56 C28 47 42 45 50 48 C58 45 72 47 78 56 C80 66 72 72 64 70 C56 68 54 62 50 63 C46 62 44 68 36 70 C28 72 20 66 22 56 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.0" />
    <line x1="32" y1="52" x2="30" y2="64" stroke="#64748B" strokeWidth="1.2" />
    <line x1="42" y1="50" x2="42" y2="62" stroke="#64748B" strokeWidth="1.2" />
    <line x1="50" y1="50" x2="50" y2="62" stroke="#64748B" strokeWidth="1.2" />
    <line x1="58" y1="50" x2="58" y2="62" stroke="#64748B" strokeWidth="1.2" />
    <line x1="68" y1="52" x2="70" y2="64" stroke="#64748B" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case "moustache_pyramidal":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-moustache_pyramidal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <polygon points="41,50 59,50 62,64 38,64" fill="#1E293B" stroke="#0F172A" strokeWidth="1.8" />
    <line x1="45" y1="52" x2="44" y2="62" stroke="#64748B" strokeWidth="1.0" />
    <line x1="50" y1="51" x2="50" y2="63" stroke="#CBD5E1" strokeWidth="1.1" />
    <line x1="55" y1="52" x2="56" y2="62" stroke="#64748B" strokeWidth="1.0" />
          </g>
        </svg>
      );

    case "mark_brow_scar":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mark_brow_scar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M24 50 C32 44 42 44 47 47" stroke="#1E293B" strokeWidth="5.0" strokeLinecap="round" fill="none" />
    <line x1="40" y1="40" x2="40" y2="54" stroke="#FAFAFA" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="40" y1="41" x2="40" y2="53" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    <line x1="38" y1="44" x2="42" y2="44" stroke="#64748B" strokeWidth="0.8" />
    <line x1="38" y1="50" x2="42" y2="50" stroke="#64748B" strokeWidth="0.8" />
          </g>
        </svg>
      );

    case "mark_cheek_scar":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mark_cheek_scar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M26 34 C36 48 48 64 64 74" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <line x1="29" y1="38" x2="35" y2="34" stroke="#64748B" strokeWidth="1.4" />
    <line x1="37" y1="49" x2="43" y2="45" stroke="#64748B" strokeWidth="1.4" />
    <line x1="46" y1="60" x2="52" y2="56" stroke="#64748B" strokeWidth="1.4" />
    <line x1="55" y1="71" x2="61" y2="67" stroke="#64748B" strokeWidth="1.4" />
          </g>
        </svg>
      );

    case "mark_teardrop_tattoo":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mark_teardrop_tattoo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M34 42 C40 37 48 37 54 42 C48 46 40 46 34 42 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
    <path d="M52 50 C52 50 48 56 48 59 C48 61.5 50 63.5 52 63.5 C54 63.5 56 61.5 56 59 C56 56 52 50 52 50 Z" fill="#0F172A" stroke="#334155" strokeWidth="1.0" />
          </g>
        </svg>
      );

    case "mark_temple_tattoo":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mark_temple_tattoo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <line x1="50" y1="36" x2="50" y2="64" stroke="#0F172A" strokeWidth="3.6" strokeLinecap="round" />
    <line x1="38" y1="45" x2="62" y2="45" stroke="#0F172A" strokeWidth="3.6" strokeLinecap="round" />
    <circle cx="50" cy="45" r="1.2" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case "mark_freckles":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mark_freckles" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            <g fill="#78350F" opacity={0.85}>
              <circle cx="34" cy="50" r="1.4" /><circle cx="38" cy="46" r="1.2" /><circle cx="42" cy="52" r="1.3" />
              <circle cx="36" cy="56" r="1.5" /><circle cx="40" cy="58" r="1.1" /><circle cx="45" cy="48" r="1.3" />
              <circle cx="48" cy="52" r="1.6" /><circle cx="50" cy="46" r="1.2" /><circle cx="52" cy="52" r="1.5" />
              <circle cx="55" cy="48" r="1.4" /><circle cx="58" cy="52" r="1.2" /><circle cx="62" cy="46" r="1.3" />
              <circle cx="64" cy="50" r="1.5" /><circle cx="60" cy="56" r="1.4" /><circle cx="66" cy="54" r="1.2" />
            </g>
          </g>
        </svg>
      );

    case "mark_cleft_chin":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gold-grad-mark_cleft_chin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <g className="forensic-feature" strokeLinecap="round" strokeLinejoin="round">
            
    <path d="M28 54 C34 76 66 76 72 54" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
    <path d="M46 62 C48 66 50 70 50 75 C50 70 52 66 54 62" stroke="#1E293B" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="74" r="1.5" fill="#1E293B" />
          </g>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <rect x="2" y="2" width="96" height="96" rx="10" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="20" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 3" />
        </svg>
      );
  }
}
