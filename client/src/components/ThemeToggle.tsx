import { Moon, Sun, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("high-contrast");
    } else {
      setTheme("light");
    }
  };

  const getLabel = () => {
    if (theme === "high-contrast") return "HC";
    return null;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      data-testid="button-theme-toggle"
      className="relative h-16 w-16"
    >
      {theme === "light" && (
        <Sun className="h-6 w-6" />
      )}
      {theme === "dark" && (
        <Moon className="h-6 w-6" />
      )}
      {theme === "high-contrast" && (
        <SunMedium className="h-6 w-6 text-yellow-400" />
      )}
      {getLabel() && (
        <span className="absolute bottom-1 text-[10px] font-bold text-yellow-400">
          {getLabel()}
        </span>
      )}
      <span className="sr-only">
        {theme === "light" && "Switch to dark mode"}
        {theme === "dark" && "Switch to high contrast mode"}
        {theme === "high-contrast" && "Switch to light mode"}
      </span>
    </Button>
  );
}
