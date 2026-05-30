"use client";

import { ActivityList } from "@/components/ActivityList";
import { useStudent, StudentClassroom } from "@/store/StudentContext";
import { Sword } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardActivitiesPage() {
  const { student, activeClassroomId } = useStudent();

  if (!student) return null;

  const activeRoom = student.classrooms.find((c: StudentClassroom) => c.id === activeClassroomId);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <h3 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
          <Sword className="text-purple-400 font-bold" size={28} />
          Mural de Missões
        </h3>
        {activeRoom && (
          <p className="text-slate-400 text-xs mt-1">
            Visualizando atividades de <span className="text-purple-400 font-bold">{activeRoom.name}</span> ({activeRoom.subject})
          </p>
        )}
      </motion.div>

      <ActivityList />
    </div>
  );
}
