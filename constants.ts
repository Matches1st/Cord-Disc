import { ThemeDefinition, ThemeColor } from './types';

export const THEMES: Record<ThemeColor, ThemeDefinition> = {
  white: {
    bg: "bg-white",
    text: "text-gray-900",
    hover: "hover:bg-gray-100",
    border: "border-gray-200",
    muted: "text-gray-500",
    input: "bg-gray-50 border-gray-300 focus:border-blue-500",
    bubbleSelf: "bg-blue-600 text-white",
    bubbleOther: "bg-gray-200 text-gray-900"
  },
  red: {
    bg: "bg-red-600",
    text: "text-white",
    hover: "hover:bg-red-700",
    border: "border-red-700",
    muted: "text-red-200",
    input: "bg-red-800 border-red-700 text-white placeholder-red-300 focus:border-white",
    bubbleSelf: "bg-white text-red-600",
    bubbleOther: "bg-red-800 text-white"
  },
  orange: {
    bg: "bg-orange-600",
    text: "text-white",
    hover: "hover:bg-orange-700",
    border: "border-orange-700",
    muted: "text-orange-200",
    input: "bg-orange-800 border-orange-700 text-white placeholder-orange-300",
    bubbleSelf: "bg-white text-orange-600",
    bubbleOther: "bg-orange-800 text-white"
  },
  yellow: {
    bg: "bg-yellow-400",
    text: "text-black",
    hover: "hover:bg-yellow-500",
    border: "border-yellow-500",
    muted: "text-yellow-900/70",
    input: "bg-yellow-100 border-yellow-500 text-black placeholder-yellow-700",
    bubbleSelf: "bg-black text-yellow-400",
    bubbleOther: "bg-white text-black"
  },
  green: {
    bg: "bg-green-600",
    text: "text-white",
    hover: "hover:bg-green-700",
    border: "border-green-700",
    muted: "text-green-200",
    input: "bg-green-800 border-green-700 text-white placeholder-green-300",
    bubbleSelf: "bg-white text-green-600",
    bubbleOther: "bg-green-800 text-white"
  },
  blue: {
    bg: "bg-blue-600",
    text: "text-white",
    hover: "hover:bg-blue-700",
    border: "border-blue-700",
    muted: "text-blue-200",
    input: "bg-blue-800 border-blue-700 text-white placeholder-blue-300",
    bubbleSelf: "bg-white text-blue-600",
    bubbleOther: "bg-blue-800 text-white"
  },
  indigo: {
    bg: "bg-indigo-600",
    text: "text-white",
    hover: "hover:bg-indigo-700",
    border: "border-indigo-700",
    muted: "text-indigo-200",
    input: "bg-indigo-800 border-indigo-700 text-white placeholder-indigo-300",
    bubbleSelf: "bg-white text-indigo-600",
    bubbleOther: "bg-indigo-800 text-white"
  },
  violet: {
    bg: "bg-violet-600",
    text: "text-white",
    hover: "hover:bg-violet-700",
    border: "border-violet-700",
    muted: "text-violet-200",
    input: "bg-violet-800 border-violet-700 text-white placeholder-violet-300",
    bubbleSelf: "bg-white text-violet-600",
    bubbleOther: "bg-violet-800 text-white"
  },
  gray: {
    bg: "bg-gray-800",
    text: "text-white",
    hover: "hover:bg-gray-700",
    border: "border-gray-700",
    muted: "text-gray-400",
    input: "bg-gray-900 border-gray-700 text-white placeholder-gray-500",
    bubbleSelf: "bg-blue-600 text-white",
    bubbleOther: "bg-gray-700 text-white"
  },
  black: {
    bg: "bg-black",
    text: "text-white",
    hover: "hover:bg-zinc-900",
    border: "border-zinc-800",
    muted: "text-zinc-500",
    input: "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600",
    bubbleSelf: "bg-white text-black",
    bubbleOther: "bg-zinc-800 text-white"
  }
};
