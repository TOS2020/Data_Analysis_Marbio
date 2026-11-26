/**
 * Assay Type Registry
 * 
 * To add a new assay type, simply add a new entry to this array.
 * The UI will automatically generate a radio button and load the
 * corresponding panel component.
 */

import viabilityIcon from '../assets/viability.png';

export const ASSAY_TYPES = [
  {
    id: 'mic',
    name: 'MIC Assay',
    description: 'Minimum Inhibitory Concentration assay for antimicrobial testing',
    icon: '🦠',
  },
  {
    id: 'dppiv',
    name: 'DPP-IV Assay',
    description: 'Dipeptidyl peptidase-IV inhibition assay',
    icon: '🧪',
  },
  {
    id: 'biofilm',
    name: 'Biofilm Assay',
    description: 'Biofilm inhibition assay for microbial testing',
    icon: '🧫',
  },
  {
    id: 'viability',
    name: 'Viability Assay',
    description: 'Cell viability and metabolic activity assay',
    icon: viabilityIcon,
  },
  {
    id: 'anti-inflammatory',
    name: 'Anti-inflammatory Assay',
    description: 'Inhibition of inflammatory markers',
    icon: '🔥',
  },
  // Add new assay types here:
  // {
  //   id: 'unique-id',
  //   name: 'Display Name',
  //   description: 'Brief description',
  //   icon: '🔬',
  // },
];

export const CONCENTRATION_UNITS = ['µg/mL', 'mg/mL', 'nM', 'µM'];

export const BACTERIAL_STRAINS = [
  { id: 'e-faecalis', name: 'E. faecalis', fullName: 'Enterococcus faecalis', assayName: 'EFAECALIS_MIC' },
  { id: 'e-coli', name: 'E. coli', fullName: 'Escherichia coli', assayName: 'ECOLI_MIC' },
  { id: 'p-aeruginosa', name: 'P. aeruginosa', fullName: 'Pseudomonas aeruginosa', assayName: 'PAERUGINOSA_MIC' },
  { id: 's-aureus', name: 'S. aureus', fullName: 'Staphylococcus aureus', assayName: 'SAUREUS_MIC' },
  { id: 's-agalactiae', name: 'S. agalactiae', fullName: 'Streptococcus agalactiae', assayName: 'STREPTB_MIC' },
];

export const MIC_PLATES_PER_SET = 5;
export const DPPIV_SAMPLES_PER_PLATE = 6;

export const PLATE_READERS = [
  { id: 'tecan-spark', name: 'Tecan Spark®', icon: '⚡' },
  { id: 'pe-victor', name: 'PerkinElmer VICTOR™', icon: '🏆' },
];
