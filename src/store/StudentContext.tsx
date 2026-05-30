"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchApi, getAuthToken } from "@/lib/api";

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: string;
  xp?: number;
}

export interface StudentClassroom {
  id: string;
  name: string;
  subject: string;
  code: string;
}

interface StudentContextType {
  student: (UserData & { classrooms: StudentClassroom[] }) | null;
  loading: boolean;
  activeClassroomId: string | null;
  setActiveClassroomId: (id: string | null) => void;
  joinRoom: (roomCode: string) => Promise<void>;
  refreshStudent: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const DEFAULT_CLASSROOMS: StudentClassroom[] = [
  { id: "1", name: "9º Ano A", subject: "Matemática", code: "MAT-9A" },
  { id: "2", name: "8º Ano B", subject: "Geometria", code: "GEO-8B" },
  { id: "3", name: "Ensino Médio - 3º A", subject: "Física", code: "FIS-3A" },
];

// Helper to find a classroom by its code, checking defaults and all local classrooms created by teachers
export const findClassroomByCode = (code: string): StudentClassroom | null => {
  const normalizedCode = code.trim().toUpperCase();
  
  // 1. Check default rooms
  const foundDefault = DEFAULT_CLASSROOMS.find(
    (c) => c.code.toUpperCase() === normalizedCode
  );
  if (foundDefault) return foundDefault;

  // 2. Check local storage for any teacher rooms (simulating a database/global registry in dev)
  if (typeof window !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ativhub_rooms_")) {
        try {
          const rooms = JSON.parse(localStorage.getItem(key) || "[]");
          const room = rooms.find(
            (r: any) => r.code && r.code.toUpperCase() === normalizedCode
          );
          if (room) {
            return {
              id: room.id || Math.random().toString(36).substring(2, 9),
              name: room.name,
              subject: room.subject,
              code: room.code,
            };
          }
        } catch (e) {
          console.error("Erro ao analisar salas no localStorage chave:", key, e);
        }
      }
    }
  }

  return null;
};

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<(UserData & { classrooms: StudentClassroom[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeClassroomId, setActiveClassroomIdState] = useState<string | null>(null);

  const setActiveClassroomId = (id: string | null) => {
    setActiveClassroomIdState(id);
    if (student?.id && id) {
      localStorage.setItem(`ativhub_active_room_${student.id}`, id);
    }
  };

  const loadStudentData = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await fetchApi("/users/me");
      if (userData.role !== "ALUNO") {
        setLoading(false);
        return;
      }

      // Load classrooms from localStorage or user classrooms if the API provides it
      const storedRoomsKey = `ativhub_student_classrooms_${userData.id}`;
      const localRoomsRaw = localStorage.getItem(storedRoomsKey);
      const localClassrooms = localRoomsRaw ? JSON.parse(localRoomsRaw) : [];
      
      const classrooms = userData.classrooms || localClassrooms;

      setStudent({
        ...userData,
        classrooms,
      });

      // Load persistent active room or default to first classroom
      const savedActiveRoom = localStorage.getItem(`ativhub_active_room_${userData.id}`);
      if (savedActiveRoom && classrooms.some((c: StudentClassroom) => c.id === savedActiveRoom)) {
        setActiveClassroomIdState(savedActiveRoom);
      } else if (classrooms.length > 0) {
        setActiveClassroomIdState(classrooms[0].id);
        localStorage.setItem(`ativhub_active_room_${userData.id}`, classrooms[0].id);
      } else {
        setActiveClassroomIdState(null);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do estudante no contexto:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const refreshStudent = async () => {
    setLoading(true);
    await loadStudentData();
  };

  const joinRoom = async (roomCode: string) => {
    if (!student) throw new Error("Estudante não autenticado.");

    const normalizedCode = roomCode.trim().toUpperCase();

    // 1. Call the API backend to join the classroom
    await fetchApi("/classrooms/join", {
      method: "POST",
      body: JSON.stringify({ code: normalizedCode }),
    });

    // 2. Reload student data from backend to get updated classrooms
    const userData = await fetchApi("/users/me");
    if (userData.role !== "ALUNO") {
      throw new Error("Usuário inválido.");
    }

    const classrooms = userData.classrooms || [];

    setStudent({
      ...userData,
      classrooms,
    });

    // 3. Find the newly joined room and set it as active
    const joinedRoom = classrooms.find(
      (c: StudentClassroom) => c.code.toUpperCase() === normalizedCode
    );
    if (joinedRoom) {
      setActiveClassroomId(joinedRoom.id);
    }
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        loading,
        activeClassroomId,
        setActiveClassroomId,
        joinRoom,
        refreshStudent,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudent deve ser utilizado dentro de um StudentProvider");
  }
  return context;
};
