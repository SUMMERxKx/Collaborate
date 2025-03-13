import { create } from 'zustand';
import type { 
  CanvasState, 
  AnyCanvasItem, 
  CanvasItemType, 
  Position,
  CanvasItemContent,
  TextItem,
  DrawingItem,
  StickyNoteItem,
  TaskItem
} from '@/types/canvas';
import { supabase } from '@/lib/supabase';

interface CanvasStore extends CanvasState {
  setItems: (items: AnyCanvasItem[]) => void;
  addItem: (item: AnyCanvasItem) => void;
  updateItem: (id: string, updates: Partial<{
    position: Position;
    content: Partial<AnyCanvasItem['content']>;
  }>) => void;
  deleteItem: (id: string) => void;
  setSelectedItemId: (id: string | null) => void;
  setCurrentTool: (tool: CanvasItemType | null) => void;
  moveItem: (id: string, position: Position) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

type CanvasStoreState = {
  items: AnyCanvasItem[];
  selectedItemId: string | null;
  currentTool: CanvasItemType | null;
  isLoading: boolean;
  error: string | null;
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  items: [],
  selectedItemId: null,
  currentTool: null,
  isLoading: false,
  error: null,

  setItems: (items) => set((state) => ({ ...state, items, error: null })),
  
  addItem: (item) => set((state) => ({
    ...state,
    items: [...state.items, item],
    error: null
  })),
  
  updateItem: (id, updates) => set((state) => {
    try {
      const item = state.items.find(i => i.id === id);
      if (!item) {
        console.warn(`Item not found: ${id}`);
        return state;
      }

      const updatedItems = state.items.map((currentItem) => {
        if (currentItem.id !== id) return currentItem;

        const updatedItem = { ...currentItem };
        if (updates.position) {
          updatedItem.position = updates.position;
        }
        if (updates.content) {
          updatedItem.content = {
            ...currentItem.content,
            ...updates.content
          };
        }
        return updatedItem;
      });

      return {
        ...state,
        items: updatedItems,
        error: null
      };
    } catch (error) {
      console.error('Error updating item:', error);
      return { ...state, error: 'Failed to update item' };
    }
  }),
  
  deleteItem: (id) => set((state) => ({
    ...state,
    items: state.items.filter((item) => item.id !== id),
    selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    error: null
  })),
  
  setSelectedItemId: (id) => set((state) => ({ ...state, selectedItemId: id })),
  
  setCurrentTool: (tool) => set((state) => ({ ...state, currentTool: tool })),
  
  moveItem: (id, position) => set((state) => {
    try {
      const item = state.items.find(i => i.id === id);
      if (!item) {
        console.warn(`Item not found: ${id}`);
        return state;
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, position } : item
        ),
        error: null
      };
    } catch (error) {
      console.error('Error moving item:', error);
      return { ...state, error: 'Failed to move item' };
    }
  }),

  setLoading: (isLoading) => set((state) => ({ ...state, isLoading })),
  
  setError: (error) => set((state) => ({ ...state, error }))
})); 