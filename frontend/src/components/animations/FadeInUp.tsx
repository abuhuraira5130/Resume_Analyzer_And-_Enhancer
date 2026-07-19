import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Props = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
};

export function FadeInUp({ children, delay = 0, y = 20, duration = 0.55, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, stagger = 0.07 }: { children: ReactNode; stagger?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger } }, hidden: {} }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, y = 16 }: { children: ReactNode; y?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
