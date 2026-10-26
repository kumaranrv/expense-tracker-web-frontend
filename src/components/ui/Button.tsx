import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    children: ReactNode;
}

const variantStyles: Record<string, string> = {
    primary: "bg-brand-500 dark:bg-teal-700 text-white active:bg-brand-600 dark:active:bg-teal-600",
    secondary: "bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 ring-1 ring-white/80 dark:ring-white/10 active:bg-white dark:active:bg-slate-800",
    ghost: "bg-transparent text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-800",
    danger: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 active:bg-red-100 dark:active:bg-red-900/50",
};

const sizeStyles: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3.5 text-base",
};

export function Button({
                           variant = "primary",
                           size = "md",
                           className,
                           children,
                           ...rest
                       }: ButtonProps) {
    return (
        <button
            className={clsx(
                "rounded-xl font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none select-none",
                "touch-manipulation active:scale-[0.98]",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...rest}
        >
            {children}
        </button>
    );
}
