
import React from 'react';

export const RISK_QUESTIONS = [
  { id: 'slopeSteepness', label: 'Steilheit > 35°', icon: <i className="fa-solid fa-mountain text-red-500"></i> },
  { id: 'freshWindSlabs', label: 'Frischer Triebschnee', icon: <i className="fa-solid fa-wind text-blue-400"></i> },
  { id: 'alarmSigns', label: 'Wumm / Risse / Lawinen', icon: <i className="fa-solid fa-triangle-exclamation text-orange-500"></i> },
  { id: 'criticalExposure', label: 'Kritische Exposition (Lee)', icon: <i className="fa-solid fa-compass text-slate-500"></i> },
];

export const CONSEQUENCE_QUESTIONS = [
  { id: 'terrainTraps', label: 'Geländefallen (Spalten, Löcher)', icon: <i className="fa-solid fa-hole text-slate-700"></i> },
  { id: 'obstacles', label: 'Hindernisse (Felsen, Bäume)', icon: <i className="fa-solid fa-tree text-green-700"></i> },
  { id: 'slopeSize', label: 'Große Hangfläche / Einzugsgebiet', icon: <i className="fa-solid fa-maximize text-slate-500"></i> },
  { id: 'burialPotential', label: 'Hohes Verschüttungspotenzial', icon: <i className="fa-solid fa-snowflake text-blue-200"></i> },
  { id: 'noSafetyDistances', label: 'Keine Entlastungsabstände möglich', icon: <i className="fa-solid fa-people-arrows text-red-400"></i> },
];

export const HAZARD_COLORS = {
  1: 'bg-green-500',
  2: 'bg-yellow-400',
  3: 'bg-orange-500',
  4: 'bg-red-600',
  5: 'bg-black text-white'
};

export const HAZARD_LABELS = {
  1: '1 - Gering',
  2: '2 - Mäßig',
  3: '3 - Erheblich',
  4: '4 - Groß',
  5: '5 - Sehr Groß'
};
