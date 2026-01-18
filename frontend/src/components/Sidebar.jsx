import React, { useState } from 'react';
import { Plus, Search, MessageSquare, Menu, LayoutGrid, Folder, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Sidebar({ threads, currentThreadId, onSelectThread, onNewThread, onDeleteThread }) {
  const [isOpen, setIsOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-muted/30 text-foreground font-sans border-r border-border">
        <div className="p-4 flex flex-col gap-2">
             <Button
                variant="ghost"
                onClick={() => {
                    onNewThread();
                    setIsOpen(false);
                }}
                className="w-full justify-start gap-3 bg-transparent hover:bg-gray-200 text-gray-700 text-sm h-10 font-normal px-2"
              >
                <Plus className="h-5 w-5 text-gray-500" />
                New chat
              </Button>

        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2">
            <div className="text-xs font-medium text-gray-400 mb-3 px-2">Your chats</div>
            <div className="flex flex-col gap-1 pb-2">
                {threads.map((thread) => {
                    const tid = thread.thread_id || thread.id;
                    return (
                        <div key={tid} className="group relative w-full">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    onSelectThread(tid);
                                    setIsOpen(false);
                                }}
                                className={`w-full justify-start gap-3 relative text-sm font-normal h-9 px-2 overflow-hidden text-ellipsis whitespace-nowrap pr-8 ${currentThreadId === tid ? 'bg-gray-200/60' : 'text-gray-600 hover:bg-gray-200/50'}`}
                            >
                                <span className="truncate">{thread.title}</span>
                            </Button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setThreadToDelete(tid);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded text-gray-500 transition-opacity"
                                title="Delete chat"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );

  return (
    <>
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-shrink-0 w-[260px] h-full flex-col">
            <SidebarContent />
            
            <AlertDialog open={!!threadToDelete} onOpenChange={(open) => !open && setThreadToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the chat history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                            onClick={(e) => {
                                if (threadToDelete) {
                                    onDeleteThread(threadToDelete);
                                    setThreadToDelete(null);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        {/* Mobile Sidebar (Sheet) */}
        <div className="md:hidden absolute top-4 left-4 z-50">
             <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                        <Menu className="h-6 w-6 text-gray-700" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r-0 w-[280px] bg-[#f9f9f9]">
                    <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </div>
    </>
  );
}
