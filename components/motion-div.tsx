// 把普通 div 的属性 + MotionProps 拼在一起
import { motion, MotionProps } from 'framer-motion';

type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & MotionProps;

// 一劳永逸：motion.div 视为带这些 props 的组件
export const MotionDiv = motion.div as React.FC<MotionDivProps>;
