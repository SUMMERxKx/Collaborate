export type CanvasItemType = 'text' | 'drawing' | 'sticky-note' | 'task';

export interface Position {
  x: number;
  y: number;
}

export interface BaseCanvasItem<T extends CanvasItemType, C> {
  id: string;
  group_id: string;
  type: T;
  content: C;
  position: Position;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface TextContent {
  text: string;
  fontSize: number;
  color: string;
}

export interface DrawingContent {
  paths: Array<{
    points: Position[];
    color: string;
    width: number;
  }>;
}

export interface StickyNoteContent {
  text: string;
  color: string;
}

export interface TaskContent {
  title: string;
  description: string;
  assignee?: string;
  completed: boolean;
  dueDate?: string;
}

export type TextItem = BaseCanvasItem<'text', TextContent>;
export type DrawingItem = BaseCanvasItem<'drawing', DrawingContent>;
export type StickyNoteItem = BaseCanvasItem<'sticky-note', StickyNoteContent>;
export type TaskItem = BaseCanvasItem<'task', TaskContent>;

export type AnyCanvasItem = TextItem | DrawingItem | StickyNoteItem | TaskItem;

export type CanvasItemContent<T extends CanvasItemType> = 
  T extends 'text' ? TextContent :
  T extends 'drawing' ? DrawingContent :
  T extends 'sticky-note' ? StickyNoteContent :
  T extends 'task' ? TaskContent :
  never;

export interface CanvasState {
  items: AnyCanvasItem[];
  selectedItemId: string | null;
  currentTool: CanvasItemType | null;
  isLoading: boolean;
  error: string | null;
} 