import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface NumberStepperProps {
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  id?: string;
  "data-testid"?: string;
  className?: string;
  integer?: boolean;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder,
  id,
  "data-testid": dataTestId,
  className = "",
  integer = false,
}: NumberStepperProps) {
  const numValue = typeof value === "string" ? parseFloat(value) || min : value;

  const handleIncrement = () => {
    const newValue = numValue + step;
    if (max === undefined || newValue <= max) {
      onChange(integer ? Math.round(newValue) : newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = numValue - step;
    if (newValue >= min) {
      onChange(integer ? Math.round(newValue) : newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange(min);
      return;
    }

    const parsed = integer ? parseInt(inputValue) : parseFloat(inputValue);
    if (!isNaN(parsed)) {
      let newValue = parsed;
      if (newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;
      onChange(newValue);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={numValue <= min}
        data-testid={dataTestId ? `${dataTestId}-decrement` : undefined}
        className="h-14 w-14 shrink-0 border-2"
      >
        <Minus className="h-6 w-6" />
      </Button>

      <Input
        id={id}
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        data-testid={dataTestId}
        className="h-14 text-lg font-mono text-center border-2"
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={max !== undefined && numValue >= max}
        data-testid={dataTestId ? `${dataTestId}-increment` : undefined}
        className="h-14 w-14 shrink-0 border-2"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
