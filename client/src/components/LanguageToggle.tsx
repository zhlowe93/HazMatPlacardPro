import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Languages } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === "en" ? "es" : "en")}
      data-testid="button-language-toggle"
      className="h-16 w-16"
    >
      <div className="flex flex-col items-center">
        <Languages className="h-5 w-5" />
        <span className="text-[10px] font-bold mt-0.5">
          {language.toUpperCase()}
        </span>
      </div>
    </Button>
  );
}
