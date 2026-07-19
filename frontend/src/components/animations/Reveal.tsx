import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

type Props = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  direction?: Direction;
  once?: boolean;
  amount?: number;
};

export function Reveal({
  children,
  delay = 0,
  duration = 0.7,
  direction = "up",
  y,
  x,
  once = true,
  amount = 0.2,
  ...rest
}: Props) {
  const reduce = useReducedMotion();
  const offset = 28;
  const dx = x ?? (direction === "left" ? -offset : direction === "right" ? offset : 0);
  const dy = y ?? (direction === "up" ? offset : direction === "down" ? -offset : 0);

  if (reduce) return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, x: dx, y: dy }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  children,
  stagger = 0.08,
  once = true,
  amount = 0.15,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  once?: boolean;
  amount?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{ visible: { transition: { staggerChildren: stagger } }, hidden: {} }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  y = 20,
  className,
}: {
  children: ReactNode;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}