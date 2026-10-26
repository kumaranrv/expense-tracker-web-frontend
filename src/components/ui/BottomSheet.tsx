import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

/**
 * Adaptive dialog used for Add/Edit Expense: a draggable bottom sheet below
 * 768px and a centered modal card from `md` up.
 */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
    const isModal = useMediaQuery("(min-width: 768px)");

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label={title}
                            className="pointer-events-auto max-h-[90vh] w-full overflow-y-auto glass glass-strong rounded-t-3xl pb-[env(safe-area-inset-bottom)] shadow-2xl md:max-w-lg md:rounded-3xl md:pb-0 lg:max-w-xl"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            drag={isModal ? false : "y"}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.15}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 120) onClose();
                            }}
                        >
                            <div className="flex justify-center pt-3 md:hidden">
                                <div className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
                            </div>
                            <div className="flex items-center justify-between px-5 pt-3 md:px-6 md:pt-5">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-800"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="px-5 pb-6 pt-2 md:px-6 md:pb-8">{children}</div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
