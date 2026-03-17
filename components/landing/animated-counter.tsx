"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  from?: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  from = 0,
  duration = 1.5,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(from);
  const spring = useSpring(from, { stiffness: 60, damping: 30 });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsub = spring.on("change", (v) =>
      setDisplayValue(decimals > 0 ? Math.round(v * 10 ** decimals) / 10 ** decimals : Math.round(v))
    );
    return () => unsub();
  }, [spring, decimals]);

  return (
    <span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: React.ReactNode;
  delay?: number;
}

export function AnimatedStat({ value, suffix = "", prefix = "", label, icon, delay = 0 }: AnimatedStatProps) {
  const decimals = value % 1 !== 0 ? 1 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      {icon && (
        <div className="mb-2 flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.2 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-violet-400"
          >
            {icon}
          </motion.div>
        </div>
      )}
      <p className="text-3xl font-black text-white sm:text-4xl">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} prefix={prefix} duration={1.2} />
      </p>
      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    </motion.div>
  );
}
