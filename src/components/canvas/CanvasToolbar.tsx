'use client';

import React from 'react';
import { useCanvasStore } from '@/store/canvas';
import type { CanvasItemType } from '@/types/canvas';
import {
  CursorArrowRaysIcon,
  PencilIcon,
  DocumentTextIcon,
  Square3Stack3DIcon,
  CheckCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface ToolButtonProps {
  tool: CanvasItemType | 'select';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function ToolButton({ tool, icon: Icon, label, isActive, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center p-2 rounded-lg ${
        isActive
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}
      onClick={onClick}
      title={label}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

export default function CanvasToolbar() {
  const { currentTool, selectedItemId, setCurrentTool, deleteItem } = useCanvasStore();

  const tools = [
    { id: 'select', icon: CursorArrowRaysIcon, label: 'Select' },
    { id: 'drawing', icon: PencilIcon, label: 'Draw' },
    { id: 'text', icon: DocumentTextIcon, label: 'Text' },
    { id: 'sticky-note', icon: Square3Stack3DIcon, label: 'Note' },
    { id: 'task', icon: CheckCircleIcon, label: 'Task' },
  ] as const;

  const handleToolClick = (tool: typeof tools[number]['id']) => {
    setCurrentTool(tool === 'select' ? null : (tool as CanvasItemType));
  };

  const handleDelete = () => {
    if (selectedItemId) {
      deleteItem(selectedItemId);
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool.id}
            icon={tool.icon}
            label={tool.label}
            isActive={tool.id === 'select' ? !currentTool : currentTool === tool.id}
            onClick={() => handleToolClick(tool.id)}
          />
        ))}
      </div>
      {selectedItemId && (
        <div className="border-t pt-2">
          <button
            type="button"
            className="flex items-center justify-center w-full p-2 text-red-600 hover:bg-red-50 rounded-lg"
            onClick={handleDelete}
          >
            <TrashIcon className="h-6 w-6" />
            <span className="text-xs ml-1">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
} 