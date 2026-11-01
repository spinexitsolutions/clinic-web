import {
  Activity, Ambulance, Baby, Bone, Brain, Ear, Eye, HandHeart, Heart, HeartPulse, Hospital, Leaf, Microscope, Pill,
  ShieldCheck, Sparkles, Stethoscope, Syringe, Toothbrush, Users, type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Activity, Ambulance, Baby, Bone, Brain, Ear, Eye, HandHeart, Heart, HeartPulse, Hospital, Leaf, Microscope, Pill,
  ShieldCheck, Sparkles, Stethoscope, Syringe, Toothbrush, Users,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, className, strokeWidth = 1.6 }: { name: string; className?: string; strokeWidth?: number }) {
  const C = ICONS[name] ?? Stethoscope;
  return <C className={className} strokeWidth={strokeWidth} />;
}
