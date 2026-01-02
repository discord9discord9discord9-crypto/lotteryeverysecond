interface BallProps {
  value: number;
  type?: "normal" | "star" | "power";
  isMatch?: boolean;
}

function Ball({ value, type = "normal", isMatch = false }: BallProps) {
  const className = `ball ${type === "star" ? "star" : ""} ${type === "power" ? "power" : ""} ${isMatch ? "match" : ""}`;

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
