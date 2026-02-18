"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function WorkspaceSelector() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();

  return (
    <div className="flex items-center gap-2" role="region" aria-label="Workspace selection">
      <label htmlFor="workspace-select" className="sr-only">
        Select workspace
      </label>
      <select
  className="rounded-lg border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  style={{
    borderColor: "var(--color-border-light)",
    color: "var(--color-text-primary)",
    background: "var(--color-background)",
  }}


        aria-label="Select active workspace"
        aria-describedby="workspace-description"
      >
        {workspaces.map((workspace) => (
          <option
  key={workspace.id}
  value={workspace.id}
  style={{ color: "var(--color-text-primary)" }}
>
  {workspace.name}
</option>

        ))}
      </select>
      <div id="workspace-description" className="sr-only">
        Choose which workspace to view and manage. Current workspace: {activeWorkspace.name}
      </div>
    </div>
  );
}
