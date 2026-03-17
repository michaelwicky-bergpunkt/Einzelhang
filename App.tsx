import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { RiskAssessment, ConsequenceAssessment, SubLevel, AvalancheProblem, SlopeCategory } from './types';

// Define initial values for risk assessment
const INITIAL_RISK: RiskAssessment = {
  level: { main: 1, sub: 'neutral' },
  slope: '<30°',
  trailBreaking: false,
  alarmSigns: 'none',
  frequentTracks: false
};

// Define initial values for consequence assessment
const INITIAL_CONSEQUENCES: ConsequenceAssessment = {
  heightAbove: 20,
  terrainTraps: null,
  exposedPeople: null
};

interface ExtraConsequences {
  mode: 'ascent' | 'descent' | null;
  safePoints: boolean;
  escapeRoutes: boolean;
  thinSlab: boolean;
  fastRescue: boolean;
}

const INITIAL_EXTRA_CONSEQUENCES: ExtraConsequences = {
  mode: null,
  safePoints: false,
  escapeRoutes: false,
  thinSlab: false,
  fastRescue: false
};

interface DetailedQuestion {
  group?: string;
  question: string;
  options: { label: string; value: number; color: string; borderColor: string }[];
}

const PROBLEM_DETAILS: Record<AvalancheProblem, DetailedQuestion[]> = {
  neuschnee: [
    {
      question: "Wie war in diesem Hang die Schneeoberfläche vor dem Neuschneefall im Vergleich zu anderen Hängen dieser Gefahrenstufe?",
      options: [
        { label: "Härter, unregelmässiger", value: 0, color: "bg-green-500", borderColor: "border-green-500" },
        { label: "", value: 1, color: "bg-yellow-400", borderColor: "border-yellow-400" },
        { label: "", value: 2, color: "bg-orange-500", borderColor: "border-orange-500" },
        { label: "lockerer, regelmässiger", value: 3, color: "bg-red-500", borderColor: "border-red-500" }
      ]
    },
    {
      question: "Hat es in diesem Hang mehr Neuschnee, mehr Windeinfluss?",
      options: [
        { label: "weniger", value: 0, color: "bg-green-500", borderColor: "border-green-500" },
        { label: "eher weniger", value: 1, color: "bg-yellow-400", borderColor: "border-yellow-400" },
        { label: "mehr", value: 2, color: "bg-orange-500", borderColor: "border-orange-500" },
        { label: "deutlich mehr", value: 3, color: "bg-red-500", borderColor: "border-red-500" }
      ]
    },
    {
      question: "Wie viel Höhenmeter bist du über der gewarnten Höhenlage?",
      options: [
        { label: "bei der Grenze", value: 0, color: "bg-green-500", borderColor: "border-green-500" },
        { label: "300Hm", value: 1, color: "bg-yellow-400", borderColor: "border-yellow-400" },
        { label: "600 Hm", value: 2, color: "bg-orange-500", borderColor: "border-orange-500" },
        { label: "> 800Hm", value: 3, color: "bg-red-500", borderColor: "border-red-500" }
      ]
    }
  ],
  triebschnee: [
    {
      question: "Wie alt ist der Triebschnee?",
      options: [
        { label: ">2Tg/warm", value: 0, color: "bg-green-500", borderColor: "border-green-500" },
        { label: "", value: 1, color: "bg-yellow-400", borderColor: "border-yellow-400" },
        { label: "", value: 2, color: "bg-orange-500", borderColor: "border-orange-500" },
        { label: "<24h kalt", value: 3, color: "bg-red-500", borderColor: "border-red-500" }
      ]
    },
    {
      question: "Böschungstests gemacht. Wenn ja: Wie leicht lässt sich der Triebschnee auslösen?",
      options: [
        { label: "gar nicht", value: 0, color: "bg-green-500", borderColor: "border-green-500" },
        { label: "", value: 1, color: "bg-yellow-400", borderColor: "border-yellow-400" },
        { label: "", value: 2, color: "bg-orange-500", borderColor: "border-orange-500" },
        { label: "fast überall", value: 3, color: "bg-red-500", borderColor: "border-red-500" }
      ]
    }
  ],
  altschnee: [
    {
      question: "Wenn repräsentative Schneeprofile gemacht: Wie stabil sind diese?",
      options: [
        { label: "gut", value: 0, color: "bg-green-500", borderColor: "border-green-500" },
        { label: "mittel", value: 1, color: "bg-yellow-400", borderColor: "border-yellow-400" },
        { label: "schlecht", value: 2, color: "bg-orange-500", borderColor: "border-orange-500" },
        { label: "sehr schlecht", value: 3, color: "bg-red-500", borderColor: "border-red-500" }
      ]
    },
    {
      question: "Alarmzeichen vorhanden?",
      options: [
        { label: "lange Suche (>2Tg) keine", value: 0, color: "bg-green-500", borderColor: "border-green-500" },
        { label: "längere Suche keine", value: 1, color: "bg-yellow-400", borderColor: "border-yellow-400" },
        { label: "vereinzelt", value: 2, color: "bg-orange-500", borderColor: "border-orange-500" },
        { label: "ausgeprägt", value: 3, color: "bg-red-500", borderColor: "border-red-500" }
      ]
    }
  ],
  nassschnee: [
    {
      question: "Wieviel Wärme (Wasser) wirkt in eine kalte, noch nicht ganz durchnässte Schneedecke ein?",
      options: [
        { label: "Weniger als bislang", value: 0, color: "bg-green-500", borderColor: "border-green-500" },
        { label: "Nicht mehr als bislang", value: 1, color: "bg-yellow-400", borderColor: "border-yellow-400" },
        { label: "Mehr als bislang", value: 2, color: "bg-orange-500", borderColor: "border-orange-500" },
        { label: "Erstmalige Erwärmung", value: 3, color: "bg-red-500", borderColor: "border-red-500" }
      ]
    },
    {
      question: "Einsinktiefe ohne Skis im Nassschnee?",
      options: [
        { label: "<10cm", value: 0, color: "bg-green-500", borderColor: "border-green-500" },
        { label: "20cm", value: 1, color: "bg-yellow-400", borderColor: "border-yellow-400" },
        { label: "30-40cm", value: 2, color: "bg-orange-500", borderColor: "border-orange-500" },
        { label: ">50 cm oder Boden", value: 3, color: "bg-red-500", borderColor: "border-red-500" }
      ]
    }
  ]
};

const AVALANCHE_PROBLEMS: { id: AvalancheProblem; label: string; icon: string; color: string }[] = [
  { id: 'neuschnee', label: 'Neuschnee', icon: 'fa-snowflake', color: 'blue' },
  { id: 'triebschnee', label: 'Triebschnee', icon: 'fa-wind', color: 'sky' },
  { id: 'altschnee', label: 'Altschnee', icon: 'fa-layer-group', color: 'amber' },
  { id: 'nassschnee', label: 'Nassschnee', icon: 'fa-droplet', color: 'cyan' },
];

const SLOPE_CATEGORIES: SlopeCategory[] = ['<30°', 'um 30°', '30-35°', 'um 35°', '35-40°', 'um 40°', '40-50°'];

const ROTATION_MATRIX: Record<SlopeCategory, number[]> = {
  '<30°':   [90, 90, 90, 90, 90, 90, 90, 45, 0, 0, -90],
  'um 30°':  [90, 90, 90, 90, 90, 45, 45, 0, -45, -90, -90],
  '30-35°':  [90, 90, 90, 90, 67.5, 0, 0, -45, -90, -90, -90],
  'um 35°':  [90, 90, 45, 45, 0, -45, -67.5, -90, -90, -90, -90],
  '35-40°':  [90, 45, 0, 0, -45, -90, -90, -90, -90, -90, -90],
  'um 40°':  [45, 0, -45, -67.5, -90, -90, -90, -90, -90, -90, -90],
  '40-50°':  [0, -45, -90, -90, -90, -90, -90, -90, -90, -90, -90]
};

const App: React.FC = () => {
  const [risk, setRisk] = useState<RiskAssessment>(INITIAL_RISK);
  const [consequences, setConsequences] = useState<ConsequenceAssessment>(INITIAL_CONSEQUENCES);
  const [extraConsequences, setExtraConsequences] = useState<ExtraConsequences>(INITIAL_EXTRA_CONSEQUENCES);
  const [avalancheProblems, setAvalancheProblems] = useState<AvalancheProblem[]>([]);
  const [problemAnswers, setProblemAnswers] = useState<Record<string, Record<number, number>>>({});

  const leftThumbRotation = useMemo(() => {
    const { main, sub } = risk.level;
    const slope = risk.slope;
    
    // Map level/sub to matrix column index
    // 1 -> 0
    // 2- -> 1, 2 -> 2, 2+ -> 3
    // 3- -> 4, 3 -> 5, 3+ -> 6
    // 4- -> 7, 4 -> 8, 4+ -> 9
    // 5 -> 10
    let colIdx = 0;
    if (main === 1) colIdx = 0;
    else if (main === 2) colIdx = sub === 'minus' ? 1 : sub === 'neutral' ? 2 : 3;
    else if (main === 3) colIdx = sub === 'minus' ? 4 : sub === 'neutral' ? 5 : 6;
    else if (main === 4) colIdx = sub === 'minus' ? 7 : sub === 'neutral' ? 8 : 9;
    else if (main === 5) colIdx = 10;

    let rotation = ROTATION_MATRIX[slope][colIdx];

    if (risk.trailBreaking && risk.alarmSigns !== null) {
      if (risk.alarmSigns === 'none') rotation += 45;
      else if (risk.alarmSigns === 'rare') rotation = -45;
      else if (risk.alarmSigns === 'widespread') rotation = -90;
    }
    if (risk.frequentTracks) rotation += 90;
    
    return Math.min(Math.max(rotation, -90), 90);
  }, [risk]);

  const rightThumbRotation = useMemo(() => {
    if (risk.level.main === 5) return -90;
    let rotation = 0;
    const h = consequences.heightAbove;
    if (h <= 20) rotation = 90;
    else if (h <= 30) rotation = 90 - (h - 20) * 3;
    else if (h <= 40) rotation = 60 - (h - 30) * 3;
    else if (h <= 50) rotation = 30 - (h - 40) * 3;
    else if (h <= 70) rotation = 0 - (h - 50) * 1.5;
    else if (h <= 80) rotation = -30 - (h - 70) * 3;
    else rotation = -60 - (h - 80) * 1.5;

    if (consequences.terrainTraps === 'pronounced') rotation = -90;
    else if (consequences.terrainTraps === 'slight') rotation = (rotation > 0) ? -45 : rotation - 45;
    else if (consequences.terrainTraps === 'none') {
      // No change or maybe slight positive if we want to be explicit, 
      // but current logic just keeps the height-based rotation
    }

    if (consequences.exposedPeople === 2) rotation -= 45;
    else if (consequences.exposedPeople === 'group') rotation -= 90;
    else if (consequences.exposedPeople === 1) {
      // No change
    }

    return Math.min(Math.max(rotation, -90), 90);
  }, [consequences, risk.level.main]);

  useEffect(() => {
    const mapping: Record<string, number> = {
      'none': 1,
      'rare': 2,
      'widespread': 3
    };
    
    setProblemAnswers(prev => {
      const altschnee = prev['altschnee'] || {};
      const currentVal = altschnee[1];
      
      if (risk.alarmSigns === null) {
        if (currentVal === undefined) return prev;
        const newAltschnee = { ...altschnee };
        delete newAltschnee[1];
        return { ...prev, altschnee: newAltschnee };
      }
      
      const targetVal = mapping[risk.alarmSigns];
      if (targetVal !== undefined && currentVal !== targetVal) {
        return {
          ...prev,
          altschnee: {
            ...altschnee,
            1: targetVal
          }
        };
      }
      return prev;
    });
  }, [risk.alarmSigns]);

  const extraConsequencesSummary = useMemo(() => {
    if (extraConsequences.mode === null) return null;

    const activeAnswers = extraConsequences.mode === 'descent' 
      ? [extraConsequences.thinSlab, extraConsequences.fastRescue, extraConsequences.safePoints, extraConsequences.escapeRoutes]
      : [extraConsequences.thinSlab, extraConsequences.fastRescue];

    const jaCount = activeAnswers.filter(v => v).length;
    const neinCount = activeAnswers.length - jaCount;

    if (jaCount >= 2) {
      return { 
        text: "Allenfalls den rechten Daumen etwas nach oben drehen.", 
        color: "bg-green-50 text-green-800 border-green-200" 
      };
    } else if (neinCount >= 3 || (extraConsequences.mode === 'ascent' && neinCount >= 2)) {
      return { 
        text: "Defensiv bleiben.", 
        color: "bg-orange-50 text-orange-800 border-orange-200" 
      };
    } else {
      return { 
        text: "Rechter Daumen belassen.", 
        color: "bg-slate-50 text-slate-800 border-slate-200" 
      };
    }
  }, [extraConsequences]);

  const handleReset = useCallback(() => {
    setRisk(INITIAL_RISK);
    setConsequences(INITIAL_CONSEQUENCES);
    setExtraConsequences(INITIAL_EXTRA_CONSEQUENCES);
    setAvalancheProblems([]);
    setProblemAnswers({});
  }, []);

  const toggleProblem = (id: AvalancheProblem) => {
    setAvalancheProblems(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const setAnswer = (problemId: string, questionIdx: number, rating: number) => {
    setProblemAnswers(prev => {
      const current = (prev[problemId] || {}) as Record<number, number>;
      if (current[questionIdx] === rating) {
        const newState = { ...current };
        delete newState[questionIdx];
        return { ...prev, [problemId]: newState };
      }
      return {
        ...prev,
        [problemId]: {
          ...current,
          [questionIdx]: rating
        }
      };
    });
  };

  const getProblemSummary = (probId: AvalancheProblem) => {
    const answers = problemAnswers[probId];
    if (!answers) return null;
    const values = Object.values(answers) as number[];
    const totalQuestions = PROBLEM_DETAILS[probId].length;
    
    const showSummaryForPartial = ['nassschnee', 'altschnee', 'triebschnee'].includes(probId);
    if (!showSummaryForPartial && values.length < totalQuestions) return null;

    if (probId === 'neuschnee') {
      const allLow = values.every(v => v === 0 || v === 1);
      const allHigh = values.every(v => v === 2 || v === 3);

      if (allLow) return { 
        text: "Das sieht gut aus. Allenfalls linker Daumen etwas nach oben drehen.", 
        color: "bg-green-50 text-green-800 border-green-200" 
      };
      if (allHigh) return { 
        text: "Das scheint kritisch. Linker Daumen mindestens 45° nach unten drehen", 
        color: "bg-red-50 text-red-800 border-red-200" 
      };
      return { 
        text: "Vorschlag: Linker Daumen belassen.", 
        color: "bg-slate-50 text-slate-800 border-slate-200" 
      };
    }

    if (probId === 'triebschnee') {
      const q1 = answers[0];
      const q2 = answers[1];

      // 1. Priorität: q2 ist Orange oder Rot
      if (q2 === 2 || q2 === 3) {
        return { 
          text: "Achtung: alle Triebschneeansammlungen in Hängen >30° meiden", 
          color: "bg-red-50 text-red-800 border-red-200" 
        };
      }

      // 2. Priorität: q1 ist Orange oder Rot und q2 nicht angewählt
      if ((q1 === 2 || q1 === 3) && q2 === undefined) {
        return { 
          text: "Achtung: alle Triebschneeansammlungen in Hängen >30° meiden", 
          color: "bg-red-50 text-red-800 border-red-200" 
        };
      }

      // 3. Priorität: Kombinierte Antworten
      if (q1 !== undefined && q2 !== undefined) {
        // 1 Grün und 2 Grün
        if (q1 === 0 && q2 === 0) return { 
          text: "Die Triebschneeansammlungen sind stabil", 
          color: "bg-green-50 text-green-800 border-green-200" 
        };
        // 1 Gelb und 2 Gelb
        if (q1 === 1 && q2 === 1) return { 
          text: "Triebschneeansammlungen sind heikel", 
          color: "bg-orange-50 text-orange-800 border-orange-200" 
        };
        // 1 Gelb und 2 Grün ODER 1 Orange (q1=2) und 2 Grün
        if ((q1 === 1 || q1 === 2) && q2 === 0) return { 
          text: "Der linke Daumen oben schätzt das Risiko realistisch ein.", 
          color: "bg-green-50 text-green-800 border-green-200" 
        };
        // 2 Grün oder Gelb (q2=0/1) und 1 orange oder Rot (q1=2/3)
        if ((q2 === 0 || q2 === 1) && (q1 === 2 || q1 === 3)) {
          return { 
            text: "Unklar wie stabil, defensiv bleiben.", 
            color: "bg-orange-50 text-orange-800 border-orange-200" 
          };
        }
      }

      // Fallbacks für Einzelantworten
      const maxVal = Math.max(...values);
      if (maxVal === 1) return { text: "Unklar wie stabil, defensiv bleiben.", color: "bg-yellow-50 text-yellow-800 border-yellow-200" };
      if (maxVal === 0) return { text: "Die Daumen oben schätzen das Risiko realistisch ein.", color: "bg-green-50 text-green-800 border-green-200" };
    }

    if (probId === 'altschnee') {
      const q1 = answers[0]; // Profil-Stabilität
      const q2 = answers[1]; // Alarmzeichen

      // Specific rule: Only Question 2 is answered
      if (q1 === undefined && q2 !== undefined) {
        if (q2 === 2 || q2 === 3) return { 
          text: "Linker Daumen etwas nach unten drehen. Defensiv unterwegs sein!", 
          color: "bg-red-50 text-red-800 border-red-200" 
        };
        if (q2 === 0 || q2 === 1) return { 
          text: "Linker Daumen belassen.", 
          color: "bg-slate-50 text-slate-800 border-slate-200" 
        };
      }

      // Existing logic for both questions
      if (q1 !== undefined && q2 !== undefined) {
        if ((q1 === 0 || q1 === 1) && q2 !== 3) {
          return { 
            text: "Allenfalls den linken Daumen etwas nach oben drehen.", 
            color: "bg-green-50 text-green-800 border-green-200" 
          };
        } else {
          return { 
            text: "Linker Daumen etwas nach unten drehen. Defensiv unterwegs sein!", 
            color: "bg-red-50 text-red-800 border-red-200" 
          };
        }
      }
    }

    if (probId === 'nassschnee') {
      const q1 = answers[0]; // Wasser / Wärme
      const q2 = answers[1]; // Einsinktiefe

      // Priority rules for Q2 (Einsinktiefe)
      if (q2 === 3) return { 
        text: "Achtung es ist mit vielen Spontanlawinen zu rechnen!", 
        color: "bg-red-50 text-red-800 border-red-200" 
      };
      if (q2 === 2) return { 
        text: "Achtung: Es ist vermehrt mit Spontanlawinen zu rechnen?", 
        color: "bg-red-50 text-red-800 border-red-200" 
      };

      // Q1 triggers
      if (q1 !== undefined) {
        if (q1 === 3 || q1 === 2) return { 
          text: "Situation kann heikler werden!", 
          color: "bg-orange-50 text-orange-800 border-orange-200" 
        };
      }

      // Final Green Case: Q1 is green/yellow OR (Q1 is undefined AND Q2 is green/yellow)
      if (q1 === 0 || q1 === 1 || q2 === 0 || q2 === 1) {
        return { 
          text: "Aktuell noch kein Problem.", 
          color: "bg-green-50 text-green-800 border-green-200" 
        };
      }
    }

    return null;
  };

  const getStatusBgColor = (rot: number) => {
    if (rot >= 45) return 'bg-green-500';
    if (rot > -45) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const leftVisualAngle = -(90 - leftThumbRotation);
  const rightVisualAngle = -(90 - rightThumbRotation);

  return (
    <div className="min-h-screen bg-slate-100 pb-24 text-slate-900 font-sans selection:bg-blue-100">
      <header className="bg-slate-900 text-white p-3 md:p-4 shadow-xl sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2">
              <i className="fa-solid fa-mountain-snow text-blue-400"></i>
              Einzelhang 2-Daumen-Check
            </h1>
            <a href="https://app.bergpunkt.ch/leaflet/Achtung-Lawinen-d2b341ce6741d6f7/riskcheck-schlsselstelle-b629f1831e0fd9a9" target="_blank" rel="noopener noreferrer" className="text-lg md:text-xl text-blue-300 hover:text-blue-100 underline underline-offset-8 transition-colors font-bold flex items-center gap-2">
              Infos dazu
              <i className="fa-solid fa-arrow-up-right-from-square text-[14px]"></i>
            </a>
          </div>
          <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-red-600/10 border border-red-500/50 text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 group">
            <i className="fa-solid fa-rotate-right group-hover:rotate-180 transition-transform"></i>
            RESET
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-10">
        
        {/* POV Visual Thumbs */}
        <div className="sticky top-[102px] md:top-[80px] z-40 -mx-4 px-4 py-2 bg-slate-100/80 backdrop-blur-md">
          <section className="relative grid grid-cols-2 gap-2 bg-white/90 backdrop-blur-md p-3 md:p-5 rounded-[2rem] shadow-xl border border-white">
            <div className="flex flex-col items-center relative border-r border-slate-100 pr-1">
              <h2 className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1 px-2 py-0.5 bg-slate-100 rounded-full">GEFAHR</h2>
              <div className="relative h-20 md:h-28 flex items-center justify-center w-full">
                <div className={`text-4xl md:text-6xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${leftThumbRotation >= 45 ? 'text-green-500' : leftThumbRotation > -45 ? 'text-orange-500' : 'text-red-500'}`} style={{ transform: `scaleX(-1) rotate(${leftVisualAngle}deg)` }}>
                  <i className="fa-solid fa-thumbs-up"></i>
                </div>
              </div>
              <div className={`mt-1 inline-flex items-center justify-center px-3 py-1 rounded-lg ${getStatusBgColor(leftThumbRotation)} text-white shadow-lg ring-2 ring-white`}>
                <span className="text-base font-black">{leftThumbRotation}°</span>
              </div>
            </div>

            <div className="flex flex-col items-center relative pl-1">
              <h2 className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1 px-2 py-0.5 bg-slate-100 rounded-full">FOLGEN</h2>
              <div className="relative h-20 md:h-28 flex items-center justify-center w-full">
                <div className={`text-4xl md:text-6xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${rightThumbRotation >= 45 ? 'text-green-500' : rightThumbRotation > -45 ? 'text-orange-500' : 'text-red-500'}`} style={{ transform: `rotate(${rightVisualAngle}deg)` }}>
                  <i className="fa-solid fa-thumbs-up"></i>
                </div>
              </div>
              <div className={`mt-1 inline-flex items-center justify-center px-3 py-1 rounded-lg ${getStatusBgColor(rightThumbRotation)} text-white shadow-lg ring-2 ring-white`}>
                <span className="text-base font-black">{rightThumbRotation}°</span>
              </div>
            </div>
          </section>
        </div>

        {/* Hazard & Consequence Panels */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6 bg-white/40 p-5 rounded-[2rem] border border-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-lg"><i className="fa-solid fa-hand text-sm"></i></div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Gefahren-Beurteilung</h3>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Gefahrenstufe (LLB)</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(l => (
                  <button key={l} onClick={() => setRisk({ ...risk, level: { main: l, sub: 'neutral' }})} className={`flex-1 py-3 rounded-xl font-black text-base border-2 transition-all ${risk.level.main === l ? 'bg-slate-900 border-slate-700 text-white scale-105 shadow-xl' : 'bg-white text-slate-400 border-slate-100'}`}>
                    {l}
                  </button>
                ))}
              </div>
              {risk.level.main > 1 && risk.level.main < 5 && (
                <div className="flex gap-1.5">
                  {(['minus', 'neutral', 'plus'] as SubLevel[]).map(s => (
                    <button key={s} onClick={() => setRisk({ ...risk, level: { ...risk.level, sub: s }})} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase border-2 ${risk.level.sub === s ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/50 border-slate-100'}`}>
                      {s === 'neutral' ? 'Mittel' : `${risk.level.main}${s === 'plus' ? '+' : '-'}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Hangsteilheit</label>
              <div className="grid grid-cols-2 gap-1.5">
                {SLOPE_CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setRisk({...risk, slope: cat})} 
                    className={`py-2.5 rounded-xl font-black text-[11px] border-2 transition-all ${risk.slope === cat ? 'bg-slate-900 border-slate-700 text-white shadow-lg scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Selber gespurt?</label>
              <div className="flex gap-2">
                <button onClick={() => setRisk({...risk, trailBreaking: true, alarmSigns: risk.alarmSigns === 'none' ? null : risk.alarmSigns})} className={`flex-1 py-3 rounded-xl font-black text-sm border-2 ${risk.trailBreaking ? 'bg-orange-600 border-orange-400 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>JA</button>
                <button onClick={() => setRisk({...risk, trailBreaking: false, alarmSigns: 'none'})} className={`flex-1 py-3 rounded-xl font-black text-sm border-2 ${!risk.trailBreaking ? 'bg-green-600 border-green-400 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>NEIN</button>
              </div>
            </div>

            {risk.trailBreaking && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">4. Alarmzeichen?</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {['none', 'rare', 'widespread'].map((val, i) => (
                    <button key={val} onClick={() => setRisk({...risk, alarmSigns: val as any})} className={`py-2.5 rounded-lg font-bold text-left px-4 border-2 transition-all text-xs ${risk.alarmSigns === val ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}>
                      {['Keine', 'Selten beobachtet', 'Deutlich / Überall'][i]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setRisk({...risk, frequentTracks: !risk.frequentTracks})} className={`w-full py-4 rounded-2xl font-black text-xs border-4 transition-all flex items-center justify-center gap-2 ${risk.frequentTracks ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl scale-[1.02]' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}>
              <i className={`fa-solid ${risk.frequentTracks ? 'fa-check-double' : 'fa-circle-plus'}`}></i>
              VIEL BEFAHREN
            </button>
          </div>

          <div className="space-y-6 bg-white/40 p-5 rounded-[2rem] border border-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg"><i className="fa-solid fa-hand-fist scale-x-[-1] text-sm"></i></div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Konsequenz-Beurteilung</h3>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Potentielle Schneebrettgrösse über dir in Hm</label>
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100">
                <input type="range" min="20" max="100" step="5" value={consequences.heightAbove} onChange={(e) => setConsequences({...consequences, heightAbove: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-200 rounded-lg accent-red-600 appearance-none cursor-pointer" />
                <div className="bg-red-600 text-white px-3 py-1 mt-3 rounded-lg inline-block text-lg font-black shadow-lg">{consequences.heightAbove}m</div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Geländefallen</label>
              <div className="grid grid-cols-1 gap-1.5">
                {['none', 'slight', 'pronounced'].map((val, i) => (
                  <button key={val} onClick={() => setConsequences({...consequences, terrainTraps: val as any})} className={`py-3 rounded-xl font-bold text-left px-4 border-2 ${consequences.terrainTraps === val ? 'bg-slate-900 border-slate-700 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-500'}`}>
                    {['Keine (Freier Auslauf)', 'Wenig (Mulden/Gräben)', 'Ausgeprägt (Absturz/Wald/Felsen)'][i]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Personen</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { val: 1, icon: 'fa-person', label: 'Eine Person' },
                  { val: 2, icon: 'fa-people-arrows', label: 'Zwei Personen' },
                  { val: 'group', icon: 'fa-people-group', label: 'Gruppe (> 2)' }
                ].map(p => (
                  <button key={p.val} onClick={() => setConsequences({...consequences, exposedPeople: p.val as any})} className={`py-3 rounded-xl font-black border-2 flex items-center gap-3 px-4 text-xs ${consequences.exposedPeople === p.val ? 'bg-slate-900 border-slate-700 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}>
                    <i className={`fa-solid ${p.icon} w-4`}></i> {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Extra Consequence Factors */}
        <div className="space-y-6 bg-white/40 p-6 md:p-10 rounded-[2.5rem] border border-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><i className="fa-solid fa-list-check"></i></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Weitere Fragen zu den Konsequenzen</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setExtraConsequences({...extraConsequences, mode: 'ascent'})}
                className={`flex-1 py-3 rounded-xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 ${extraConsequences.mode === 'ascent' ? 'bg-slate-900 border-slate-800 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
              >
                <i className="fa-solid fa-arrow-trend-up"></i>
                AUFSTIEG
              </button>
              <button 
                onClick={() => setExtraConsequences({...extraConsequences, mode: 'descent'})}
                className={`flex-1 py-3 rounded-xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 ${extraConsequences.mode === 'descent' ? 'bg-slate-900 border-slate-800 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
              >
                <i className="fa-solid fa-person-skiing"></i>
                ABFAHRT
              </button>
            </div>
          </div>
          
          {extraConsequences.mode !== null && (
            <>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in duration-500">
                {[
                  { id: 'thinSlab', text: 'Dünner Anriss', type: 'both' },
                  { id: 'fastRescue', text: 'Schnelle Kameradenrettung möglich / Flugwetter', type: 'both' },
                  { id: 'safePoints', text: 'Sind geeignete Sammelpunkte vorhanden?', type: 'descent' },
                  { id: 'escapeRoutes', text: 'Gute Fluchtmöglichkeiten', type: 'descent' }
                ]
                .filter(q => q.type === 'both' || q.type === extraConsequences.mode)
                .map((q) => (
                  <div key={q.id} className="space-y-3">
                    <p className="text-sm font-black text-slate-700 pr-2">{q.text}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setExtraConsequences({...extraConsequences, [q.id]: true})} 
                        className={`flex-1 py-3 rounded-xl font-black text-xs border-2 transition-all ${extraConsequences[q.id as keyof ExtraConsequences] ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        JA
                      </button>
                      <button 
                        onClick={() => setExtraConsequences({...extraConsequences, [q.id]: false})} 
                        className={`flex-1 py-3 rounded-xl font-black text-xs border-2 transition-all ${!extraConsequences[q.id as keyof ExtraConsequences] ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        NEIN
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {extraConsequencesSummary && (
                <div className={`mt-8 p-6 rounded-2xl border-2 ${extraConsequencesSummary.color} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                  <div className="flex items-center gap-3 mb-2 opacity-60">
                    <i className="fa-solid fa-compass-drafting"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">Antwort / Empfehlung</span>
                  </div>
                  <p className="font-black text-base leading-tight">{extraConsequencesSummary.text}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Avalanche Problems Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Aktuelles Lawinenproblem in Einzelhang vorhanden?</h3>
          </div>
          
          <div className="flex flex-wrap gap-3 px-2">
            {AVALANCHE_PROBLEMS.map(prob => (
              <button
                key={prob.id}
                onClick={() => toggleProblem(prob.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 font-black text-xs transition-all ${avalancheProblems.includes(prob.id) ? 'bg-slate-900 border-slate-800 text-white shadow-xl -translate-y-1' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <i className={`fa-solid ${prob.icon} opacity-80`}></i>
                {prob.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 px-2">
            {avalancheProblems.map(probId => {
              const prob = AVALANCHE_PROBLEMS.find(p => p.id === probId);
              const summary = getProblemSummary(probId);
              if (!prob) return null;
              return (
                <div key={probId} className="bg-white rounded-[2rem] p-6 border-2 border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center`}>
                        <i className={`fa-solid ${prob.icon}`}></i>
                      </div>
                      <h4 className="font-black text-slate-800 uppercase text-sm tracking-widest">{prob.label}</h4>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    {PROBLEM_DETAILS[probId].map((q, idx) => (
                      <div key={idx} className="space-y-4">
                        {q.group && (
                          <div className="bg-slate-50 px-4 py-2 rounded-xl border-l-4 border-slate-900 mb-2 shadow-sm">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{q.group}</span>
                          </div>
                        )}
                        <p className="text-sm font-black text-slate-800 flex items-center gap-2 pl-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center shrink-0">{idx + 1}</span>
                          {q.question}
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pl-2">
                          {q.options.map(opt => {
                            const isSelected = problemAnswers[probId]?.[idx] === opt.value;
                            return (
                              <button
                                key={opt.label + opt.value}
                                onClick={() => setAnswer(probId, idx, opt.value)}
                                className={`py-3 px-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-tighter text-center h-full flex items-center justify-center border-2 ${opt.borderColor} ${isSelected ? `${opt.color} border-4 shadow-lg text-white scale-105 z-10` : 'bg-white/50 text-slate-400 hover:bg-white hover:opacity-100 opacity-90'}`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {summary && (
                    <div className={`mt-10 p-6 rounded-2xl border-2 ${summary.color} animate-in fade-in slide-in-from-bottom-2`}>
                      <div className="flex items-center gap-3 mb-2 opacity-60">
                        <i className="fa-solid fa-compass-drafting"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">Handlungs-Vorschlag</span>
                      </div>
                      <p className="font-black text-base leading-tight">{summary.text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 p-3 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Einzelhang 2-Daumen-Check</div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Gefahr: {risk.level.main} | {risk.slope}</span>
             <div className={`w-3 h-3 rounded-full ${getStatusBgColor(leftThumbRotation)} shadow-sm`}></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;