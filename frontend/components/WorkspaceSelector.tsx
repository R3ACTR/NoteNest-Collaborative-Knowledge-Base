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
          if (selected) setActiveWorkspace(selected);
        }}
        className="rounded-lg border border-blue-500 bg-black px-3 py-1 text-sm text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
        aria-label="Select active workspace"
        aria-describedby="workspace-description"
      >
        {workspaces.map((workspace) => (
          <option
            key={workspace.id}
            value={workspace.id}
            className="bg-black text-blue-400"
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
