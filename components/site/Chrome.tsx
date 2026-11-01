"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSite } from "./SiteContext";

export function AnnouncementBar() {
  const { settings } = useSite();
  if (!settings.announcement.enabled || !settings.announcement.text) return null;
  return (
    <Link
      href={settings.announcement.href || "#"}
      className="group relative z-[45] flex h-10 items-center justify-center gap-2 overflow-hidden bg-accent px-4 text-[13px] text-accent-ink"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-ink/80" />
      <span className="truncate">{settings.announcement.text}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export function WhatsAppButton() {
  const { settings } = useSite();
  if (!settings.showWhatsappButton || !settings.whatsapp) return null;
  const href = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${settings.shortName}, I'd like to book an appointment.`)}`;
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="group fixed bottom-5 right-5 z-40 hidden h-14 items-center gap-2 rounded-full bg-[#25D366] pl-4 pr-4 text-white shadow-[0_18px_40px_-12px_rgba(37,211,102,0.6)] md:bottom-8 md:right-8 lg:flex"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01Zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.24 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[14px] font-medium transition-all duration-500 group-hover:max-w-[120px]">Chat with us</span>
    </motion.a>
  );
}
