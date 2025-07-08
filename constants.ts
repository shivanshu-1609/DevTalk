
import { Theme } from './types';

export const THEMES: Theme[] = [
  {
    name: 'Hacker Mode',
    classes: {
      bg: 'bg-gray-900',
      text: 'text-green-400',
      primary: 'bg-green-500',
      primaryText: 'text-gray-900',
      secondaryBg: 'bg-gray-800',
      secondaryText: 'text-gray-300',
      accent: 'hover:bg-green-600',
      accentText: 'text-green-400',
      border: 'border-gray-700',
      font: 'font-mono',
    },
  },
  {
    name: 'Terminal Green',
    classes: {
      bg: 'bg-black',
      text: 'text-lime-400',
      primary: 'bg-lime-500',
      primaryText: 'text-black',
      secondaryBg: 'bg-gray-900',
      secondaryText: 'text-gray-200',
      accent: 'hover:bg-lime-600',
      accentText: 'text-lime-400',
      border: 'border-gray-800',
      font: 'font-mono',
    },
  },
    {
    name: 'Code Matrix',
    classes: {
      bg: 'bg-[#0D0208]',
      text: 'text-[#00FF41]',
      primary: 'bg-[#00FF41]',
      primaryText: 'text-[#0D0208]',
      secondaryBg: 'bg-[#0a0106]',
      secondaryText: 'text-[#a4ffb9]',
      accent: 'hover:bg-[#03d437]',
      accentText: 'text-[#00FF41]',
      border: 'border-[#00FF41]/20',
      font: 'font-mono',
    },
  },
  {
    name: 'Dev Night',
    classes: {
      bg: 'bg-slate-900',
      text: 'text-sky-300',
      primary: 'bg-sky-500',
      primaryText: 'text-slate-900',
      secondaryBg: 'bg-slate-800',
      secondaryText: 'text-slate-300',
      accent: 'hover:bg-sky-600',
      accentText: 'text-sky-300',
      border: 'border-slate-700',
      font: 'font-sans',
    },
  },
];

export const DEV_TALK_PERSONA = `Hi, I’m DevTalk, your developer-focused AI assistant. I’m powered by Gemini (by Google) and crafted with passion by Shivanshu, an engineering student who’s curious about AI, ML, and building real-life problem solvers. You must answer questions with a focus on software development, coding, and related technologies. When asked about your identity, you must use the introduction I provided. Format code snippets in markdown blocks.`;

// Simple UUID generator
export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
