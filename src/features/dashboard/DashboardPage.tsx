// // src/features/dashboard/DashboardPage.tsx
// import { useDashboardSummary } from "@/api/hooks/useDashboard.ts";
// import { PieBreakdown } from "../../components/charts/PieBreakdown";
// import {DashboardSkeleton} from "@/components/ui/Skeleton.tsx";
//
// export function DashboardPage() {
//     const { data, isLoading } = useDashboardSummary(); // React Query hook
//
//     if (isLoading) return <DashboardSkeleton />;
//
//     const { expenseTotal, budget, topTags } = data!;
//     const progress = budget ? Math.min(100, (expenseTotal / budget) * 100) : 0;
//
//     return (
//         <div className="min-h-screen bg-slate-50 pb-24">
//             {/* Hero card */}
//             <section className="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-teal-700 via-emerald-700 to-emerald-500 p-5 text-white shadow-lg shadow-emerald-900/20">
//                 <p className="text-sm font-medium text-emerald-100">This Month</p>
//                 <p className="mt-1 text-3xl font-bold tracking-tight">
//                     ₹{expenseTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
//                 </p>
//
//                 {budget && (
//                     <div className="mt-4">
//                         <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
//                             <div
//                                 className="h-full rounded-full bg-white transition-all duration-500"
//                                 style={{ width: `${progress}%` }}
//                             />
//                         </div>
//                         <p className="mt-1 text-xs text-emerald-100">
//                             ₹{budget.toLocaleString("en-IN")} budget · {progress.toFixed(0)}% used
//                         </p>
//                     </div>
//                 )}
//             </section>
//
//             {/* Category breakdown */}
//             <section className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
//                 <h2 className="text-sm font-semibold text-slate-700">Top Categories</h2>
//                 <PieBreakdown data={topTags} />
//                 <ul className="mt-2 divide-y divide-slate-100">
//                     {topTags.map((t) => (
//                         <li key={t.tagId} className="flex items-center justify-between py-2">
//               <span className="flex items-center gap-2 text-sm text-slate-700">
//                 <span
//                     className="h-2.5 w-2.5 rounded-full"
//                     style={{ backgroundColor: t.color }}
//                 />
//                   {t.emoji} {t.name}
//               </span>
//                             <span className="text-sm font-medium text-slate-900">
//                 ₹{t.total.toLocaleString("en-IN")}
//               </span>
//                         </li>
//                     ))}
//                 </ul>
//             </section>
//
//             {/* Bottom nav — fixed, safe-area aware */}
//             <nav className="fixed inset-x-0 bottom-0 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur">
//                 <NavItem icon="home" label="Home" active />
//                 <NavItem icon="list" label="Expenses" />
//                 <FabAddButton />
//                 <NavItem icon="tag" label="Tags" />
//                 <NavItem icon="user" label="Profile" />
//             </nav>
//         </div>
//     );
// }
