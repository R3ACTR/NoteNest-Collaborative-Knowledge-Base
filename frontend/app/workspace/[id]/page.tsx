"use client";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkspaceHome({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [noteCount, setNoteCount] = useState(0);
  useEffect(() => {
  try {
    const raw = localStorage.getItem("notenest-notes");
    const notes = raw ? JSON.parse(raw) : [];
    setNoteCount(Array.isArray(notes) ? notes.length : 0);
  } catch {
    setNoteCount(0);
  }
}, []);
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header title="Home" />

        <main className="p-8 max-w-3xl">
          <h1 className="text-2xl font-semibold mb-2">
            Welcome to your workspace 👋
          </h1>

          <p className="text-gray-500 mb-6">
            This is your personal workspace. Use quick actions to get started.
          </p>
        <p className="text-sm text-gray-600 mb-6">
  You have{" "}
  <span
    className="font-semibold cursor-pointer hover:underline"
    onClick={() => router.push(`/workspace/${params.id}/notes`)}
  >
    {noteCount}
  </span>{" "}
  notes
</p>
          <div className="flex gap-4">
            <Link
              href={`/workspace/${params.id}/notes?new=1`}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Create Note
            </Link>

            <Link
              href={`/workspace/${params.id}/dashboard`}
              className="px-4 py-2 border rounded"
            >
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}