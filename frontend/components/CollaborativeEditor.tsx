"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/api'; // Assume we have a socket singleton or similar
import { YSocketIOProvider } from '@/lib/yjs-provider';


const CollaborativeEditor = ({ noteId, currentUser }: { noteId: string, currentUser: any }) => {
    const [ydoc] = useState(() => new Y.Doc());
    const [provider, setProvider] = useState<YSocketIOProvider | null>(null);

    useEffect(() => {
        const prov = new YSocketIOProvider(socket, noteId, ydoc);
        setProvider(prov);
        
        return () => {
            prov.destroy();
            ydoc.destroy();
        }
    }, [noteId, ydoc]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false } as any),
            Collaboration.configure({
                document: ydoc,
            }),
            CollaborationCursor.configure({
                provider: provider as any, // Type mismatch might happen with custom provider, check types
                user: currentUser,
            })
        ],
    }, [provider]); // Re-create editor when provider is ready? No,// Verified imports. No changes needed.

    if (!provider) return <div>Connecting...</div>;

    return (
        <div className="prose prose-lg max-w-none w-full p-4 border rounded-xl min-h-[300px] focus-within:ring-2 ring-blue-500/20 transition-all">
             <EditorContent editor={editor} />
        </div>
    );
};

export default CollaborativeEditor;
