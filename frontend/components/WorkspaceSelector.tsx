"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function WorkspaceSelector() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();

  return (
    <div
      className="flex items-center gap-2"
      role="region"
      aria-label="Workspace selection"
    >
      <label htmlFor="workspace-select" className="sr-only">
        Select workspace
      </label>

      <select
        id="workspace-select"
        value={activeWorkspace.id}
        onChange={(e) => {
          const selected = workspaces.find(
            (w) => w.id === e.target.value
          );
          if (selected) setActiveWorkspace(selected.id);
        }}
        className="rounded-lg border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          borderColor: "rgba(255,255,255,0.12)", // ✅ Dark border
          color: "#FFFFFF", // ✅ White text
          background: "#0B0B0B", // ✅ Dark background
        }}
        aria-label="Select active workspace"
        aria-describedby="workspace-description"
      >
        {workspaces.map((workspace) => (
          <option
            key={workspace.id}
            value={workspace.id}
            style={{
              background: "#0B0B0B", // ✅ Dark dropdown items
              color: "#FFFFFF",
            }}
          >
            {workspace.name}
          </option>
        ))}
      </select>

      <div id="workspace-description" className="sr-only">
        Choose which workspace to view and manage. Current workspace:{" "}
        {activeWorkspace.name}
      </div>
    </div>
  );
}
