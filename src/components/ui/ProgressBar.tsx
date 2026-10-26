interface ProgressBarProps {
    percent: number; // 0-100
    colorClass?: string;
    trackClass?: string;
}

export function ProgressBar({
                                percent,
                                colorClass = "bg-white",
                                trackClass = "bg-white/20",
                            }: ProgressBarProps) {
    const clamped = Math.min(100, Math.max(0, percent));
    return (
        <div className={`h-2 w-full overflow-hidden rounded-full ${trackClass}`}>
            <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}
