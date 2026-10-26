import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useUpdateSettings } from "@/api/hooks/useSettings";
import { money } from "@/utils/format";
import { savingsProgress, type Streak } from "@/utils/insights";

interface Props {
    streak: Streak | null;
    budget: number | null;
    spent: number;
    goal: number | null;
}

export function StreakGoalCard({ streak, budget, spent, goal }: Props) {
    const update = useUpdateSettings();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const parsed = Number(draft);
    const valid = draft.trim() !== "" && Number.isFinite(parsed) && parsed > 0;

    function save(e: React.FormEvent) {
        e.preventDefault();
        if (!valid) return;
        update.mutate({ savingsGoal: parsed }, { onSuccess: () => setEditing(false) });
    }

    const progress = budget && goal ? savingsProgress(budget, spent, goal) : null;

    return (
        <Card role="region" aria-labelledby="streak-title" className="h-full">
            <h2 id="streak-title" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Streak &amp; savings goal</h2>
            <div className="mt-3 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">🔥</span>
                {streak ? (
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {streak.current} {streak.current === 1 ? "day" : "days"}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">under daily budget · best {streak.best}</p>
                    </div>
                ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300">Set a monthly budget to start a streak</p>
                )}
            </div>

            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                {editing || !goal ? (
                    <form onSubmit={save} className="flex items-end gap-2">
                        <label className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                            Monthly savings goal (₹)
                            <input
                                inputMode="numeric"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                aria-invalid={draft !== "" && !valid}
                                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 px-3 py-2 text-sm focus:border-brand-500 dark:focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-teal-400"
                            />
                        </label>
                        <button type="submit" disabled={!valid || update.isPending}
                                className="min-h-10 rounded-xl bg-brand-500 dark:bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:focus-visible:outline-teal-400">
                            Save
                        </button>
                        {update.isError && <p role="alert" className="sr-only">Couldn't save goal</p>}
                    </form>
                ) : (
                    <>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-800 dark:text-slate-100">Goal {money(goal)}</span>
                            <button type="button" onClick={() => { setDraft(String(goal)); setEditing(true); }}
                                    className="rounded-lg px-2 py-1 text-xs font-medium text-brand-500 dark:text-teal-300 hover:bg-brand-50 dark:hover:bg-teal-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:focus-visible:outline-teal-400">
                                Edit
                            </button>
                        </div>
                        {progress ? (
                            <>
                                <div className="mt-2">
                                    <ProgressBar percent={progress.percent} colorClass="bg-emerald-600" trackClass="bg-slate-200 dark:bg-slate-700"/>
                                </div>
                                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                                    {money(progress.saved)} unspent of budget · {Math.round(progress.percent)}% of goal
                                </p>
                            </>
                        ) : (
                            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">Set a monthly budget to track progress</p>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}
