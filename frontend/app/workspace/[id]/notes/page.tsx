import { Suspense } from "react";
import NotesPage from "@/app/notes/notes";
import Loading from "@/components/Loading";

export default function WorkspaceNotesRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <NotesPage />
    </Suspense>
  );
}
