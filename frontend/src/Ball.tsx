interface BallProps {
  value: number;
  type?: "normal" | "star" | "power";
  isMatch?: boolean;
  editable?: boolean;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
}

function Ball({ 
  value, 
  type = "normal", 
  isMatch = false, 
  editable = false,
  onChange,
  min = 1,
  max = 50
}: BallProps) {
  const className = `ball ${type === "star" ? "star" : ""} ${type === "power" ? "power" : ""} ${isMatch ? "match" : ""} ${editable ? "editable" : ""}`;

  if (editable) {
    return (
      <input
        type="number"
        min={min}
        max={max}
        value={value || ""}
        onChange={(e) => {
          const inputValue = e.target.value;
          
          if (inputValue === "") {
            onChange?.(0);
            return;
          }
          
          const num = parseInt(inputValue);
          if (!isNaN(num) && num >= min && num <= max) {
            onChange?.(num);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "e" || e.key === "E" || e.key === "-" || e.key === "+" || e.key === ".") {
            e.preventDefault();
          }
        }}
        className={className}
        placeholder="?"
      />
    );
  }

  return (
    <span
      className={className}
      style={{ "--value": value } as React.CSSProperties}
    >
      <span style={{ "--value": value } as React.CSSProperties}></span>
    </span>
  );
}

export default Ball;
