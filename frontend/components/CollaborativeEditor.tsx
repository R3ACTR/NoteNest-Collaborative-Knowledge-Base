"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';

import { socket } from '@/lib/api'; // Assume we have a socket singleton or similar
import { YSocketIOProvider } from '@/lib/yjs-provider';
import PresenceList from './PresenceList';
import CursorOverlay from './CursorOverlay';
import { Presence } from '@/types/types';


const CollaborativeEditor = ({ noteId, workspaceId, currentUser }: { noteId: string; workspaceId: string; currentUser: any }) => {
    const [ydoc] = useState(() => new Y.Doc());
    const [provider, setProvider] = useState<YSocketIOProvider | null>(null);
    const [copied, setCopied] = useState(false);
    const [lastSaved, setLastSaved] = useState<number | null>(null);
    const [presences, setPresences] = useState<Presence[]>([]);
    const [highlightedUserId, setHighlightedUserId] = useState<string | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleNoteSaved = (data: { noteId: string, timestamp: number }) => {
            if (data.noteId === noteId) {
                setLastSaved(data.timestamp);
            }
        };

        socket.on('note-saved', handleNoteSaved);
        
        return () => {
            socket.off('note-saved', handleNoteSaved);
        };
    }, [noteId]);

    // Handle presence updates
    useEffect(() => {
        const handlePresenceList = (data: { presences: Presence[] }) => {
            setPresences(data.presences.filter(p => p.userId !== currentUser?.id));
        };

        const handlePresenceUpdated = (data: { presence: Presence }) => {
            setPresences((prev) => {
                const updated = prev.filter(p => p.userId !== data.presence.userId);
                if (data.presence.userId !== currentUser?.id) {
                  return [...updated, data.presence];
                }
                return updated;
            });
        };

        const handlePresenceRemoved = (data: { userId: string }) => {
            setPresences((prev) => prev.filter(p => p.userId !== data.userId));
        };

        socket.on('presence:list', handlePresenceList);
        socket.on('presence:updated', handlePresenceUpdated);
        socket.on('presence:removed', handlePresenceRemoved);

        return () => {
            socket.off('presence:list', handlePresenceList);
            socket.off('presence:updated', handlePresenceUpdated);
            socket.off('presence:removed', handlePresenceRemoved);
        };
    }, [currentUser?.id]);

    const handleCopyNote = () => {
        if (!editor) return;
        const text = editor.getText();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExportMarkdown = () => {
        if (!editor) return;
        const html = editor.getHTML();
        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(html);
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `note-${noteId}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const prov = new YSocketIOProvider(socket, noteId, ydoc);
        setProvider(prov);

        // Join note and send presence
        const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        socket.emit('join-note', {
            noteId,
            workspaceId,
            displayName: currentUser?.name || `User-${currentUser?.id}`,
            avatarUrl: currentUser?.avatarUrl,
            color,
        });

        // Send presence updates (e.g., on cursor movement)
        const presenceHeartbeat = setInterval(() => {
            socket.emit('presence:heartbeat', { noteId });
        }, 30000); // Heartbeat every 30 seconds

        return () => {
            clearInterval(presenceHeartbeat);
            socket.emit('leave-note', noteId);
            prov.destroy();
            ydoc.destroy();
        }
    }, [noteId, workspaceId, ydoc, currentUser]);

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
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400">
                    {lastSaved ? `Last saved at ${new Date(lastSaved).toLocaleTimeString()}` : 'Saving...'}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopyNote}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-stone-700 dark:hover:bg-stone-600 rounded-md transition-colors"
                        title="Copy note to clipboard"
                    >
                        {copied ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-green-600">Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy Note</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleExportMarkdown}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md transition-colors"
                        title="Export as Markdown"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export MD</span>
                    </button>
                </div>
            </div>

            {/* Presence List */}
            <PresenceList 
                presences={presences} 
                currentUserId={currentUser?.id}
                onPresenceHover={setHighlightedUserId}
            />

            <div className="relative" ref={editorContainerRef}>
                <div className="prose prose-lg max-w-none w-full p-4 border rounded-xl min-h-[300px] focus-within:ring-2 ring-blue-500/20 transition-all">
                    <EditorContent editor={editor} />
                </div>
                {/* Cursor Overlay */}
                <CursorOverlay 
                    presences={presences} 
                    currentUserId={currentUser?.id}
                    editorContainer={editorContainerRef.current}
                />
            </div>
        </div>
    );
};

export default CollaborativeEditor;
