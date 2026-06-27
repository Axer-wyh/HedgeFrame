"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 1, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function DecryptedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const glyphs = useMemo(() => "01HFZX$#".split(""), []);
  const [resolved, setResolved] = useState(reduce ? text.length : 0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;

    const timer = window.setInterval(() => {
      setResolved((value) => Math.min(text.length, value + 1));
      setTick((value) => value + 1);
    }, 20);

    return () => window.clearInterval(timer);
  }, [reduce, text]);

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  const display = text
    .split("")
    .map((letter, index) => {
      if (index < resolved || letter === " ") return letter;
      return glyphs[(index + tick) % glyphs.length];
    })
    .join("");

  return <span className={className}>{display}</span>;
}

export function AnimatedTabs<Tab extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { label: string; value: Tab }[];
  value: Tab;
  onChange: (value: Tab) => void;
}) {
  return (
    <LayoutGroup>
      <div
        className="grid w-full gap-2 rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]/70 p-1"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`relative h-9 min-w-0 rounded-[8px] px-3 text-sm transition active:translate-y-px ${
                active
                  ? "text-[rgb(var(--hf-ink))]"
                  : "text-[rgb(var(--hf-muted))] hover:text-[rgb(var(--hf-text))]"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId="active-tab-background"
                  className="absolute inset-0 rounded-[8px] bg-[rgb(var(--hf-accent))]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative z-10 block truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function SuccessRipple({ active }: { active: boolean }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <AnimatePresence>
        {active ? (
          <>
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="absolute inset-0 rounded-full border border-[rgb(var(--hf-accent))]/45"
                initial={{ scale: 0.5, opacity: 0.65 }}
                animate={{ scale: 1.65, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.22,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        ) : null}
      </AnimatePresence>
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--hf-accent))] text-[rgb(var(--hf-ink))]">
        <CheckCircle size={22} weight="bold" />
      </div>
    </div>
  );
}
