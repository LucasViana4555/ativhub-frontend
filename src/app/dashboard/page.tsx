"use client";

import { useStudent } from "@/store/StudentContext";
import { AlunoDashboard } from "@/components/AlunoDashboard";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { student } = useStudent();

  if (!student) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AlunoDashboard user={student} />
    </motion.div>
  );
}
