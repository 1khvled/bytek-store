import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const DEFAULT_WHATSAPP_NUMBER = "+213672536920";
export const DEFAULT_WHATSAPP_MESSAGE = "Salam, j'ai une question sur un produit sur BYTEK STORE.";

function buildWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  const encoded = encodeURIComponent(message);

  // wa.me requires digits only (no +). Keep it simple.
  const waPhone = normalizedPhone.startsWith("+") ? normalizedPhone.slice(1) : normalizedPhone;
  return `https://wa.me/${waPhone}?text=${encoded}`;
}

export function WhatsAppFloatingButton({
  phone = DEFAULT_WHATSAPP_NUMBER,
  message = DEFAULT_WHATSAPP_MESSAGE,
  className,
}: {
  phone?: string;
  message?: string;
  className?: string;
}) {
  const href = buildWhatsAppUrl(phone, message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contact us on WhatsApp"
      className={cn(
        "fixed z-50 bottom-5 right-5",
        "inline-flex items-center gap-2",
        "rounded-full border border-border",
        "bg-primary text-primary-foreground",
        "shadow-lg",
        "px-4 py-3",
        "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-medium">WhatsApp</span>
    </a>
  );
}
