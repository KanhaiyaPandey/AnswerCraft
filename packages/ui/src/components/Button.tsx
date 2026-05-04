"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 600,
    borderRadius: "10px",
    border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: "13px", padding: "8px 16px" },
    md: { fontSize: "14px", padding: "12px 24px" },
    lg: { fontSize: "16px", padding: "16px 32px" },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      color: "#fff",
      boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
    },
    danger: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "#fff",
      boxShadow: "0 4px 24px rgba(239,68,68,0.35)",
    },
    ghost: {
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.85)",
      border: "1px solid rgba(255,255,255,0.1)",
    },
    outline: {
      background: "transparent",
      color: "#6366f1",
      border: "1.5px solid #6366f1",
    },
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {loading ? (
        <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      ) : icon}
      {children}
    </button>
  );
}
