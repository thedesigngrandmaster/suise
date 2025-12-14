import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Memory {
  id: string;
  image_url: string;
  caption: string | null;
  is_public: boolean;
  owner_id: string;
  display_order: number;
}

interface SortableMemoryGridProps {
  memories: Memory[];
  onReorder: (memories: Memory[]) => void;
  onImageClick: (imageUrl: string) => void;
  onEditMemory: (memory: Memory) => void;
  onDeleteMemory: (memoryId: string) => void;
  canEdit: boolean;
  userId?: string;
  isOwner: boolean;
}

function SortableMemoryItem({
  memory,
  onImageClick,
  onEditMemory,
  onDeleteMemory,
  canEdit,
  userId,
  isOwner,
}: {
  memory: Memory;
  onImageClick: (imageUrl: string) => void;
  onEditMemory: (memory: Memory) => void;
  onDeleteMemory: (memoryId: string) => void;
  canEdit: boolean;
  userId?: string;
  isOwner: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: memory.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const canManage = isOwner || memory.owner_id === userId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "z-50 opacity-80"
      )}
    >
      <button
        onClick={() => onImageClick(memory.image_url)}
        className="aspect-square rounded-2xl overflow-hidden hover:opacity-90 transition-opacity w-full"
      >
        <img
          src={memory.image_url}
          alt={memory.caption || "Memory"}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Drag handle */}
      {canEdit && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-1.5 shadow-md">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Memory actions overlay */}
      {canManage && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditMemory(memory)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Caption
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeleteMemory(memory.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Caption overlay */}
      {memory.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
          <p className="text-white text-sm truncate">{memory.caption}</p>
        </div>
      )}
    </div>
  );
}

export function SortableMemoryGrid({
  memories,
  onReorder,
  onImageClick,
  onEditMemory,
  onDeleteMemory,
  canEdit,
  userId,
  isOwner,
}: SortableMemoryGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = memories.findIndex((m) => m.id === active.id);
      const newIndex = memories.findIndex((m) => m.id === over.id);

      const reordered = arrayMove(memories, oldIndex, newIndex).map(
        (memory, index) => ({
          ...memory,
          display_order: index + 1,
        })
      );

      onReorder(reordered);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={memories.map((m) => m.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {memories.map((memory) => (
            <SortableMemoryItem
              key={memory.id}
              memory={memory}
              onImageClick={onImageClick}
              onEditMemory={onEditMemory}
              onDeleteMemory={onDeleteMemory}
              canEdit={canEdit}
              userId={userId}
              isOwner={isOwner}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
