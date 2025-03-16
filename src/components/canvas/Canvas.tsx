'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '@/store/canvas';
import { supabase } from '@/lib/supabase';
import type { AnyCanvasItem, Position } from '@/types/canvas';
import { Canvas as FabricCanvas, IText, Group, Path, Rect, Text } from 'fabric';

// Type declaration for fabric instance
declare module 'fabric' {
  interface ITextOptions {
    text?: string;
  }

  interface Object {
    data?: {
      id: string;
    };
    left?: number;
    top?: number;
    selectable?: boolean;
    evented?: boolean;
  }

  interface IText {
    text: string;
  }

  interface Group {
    addWithUpdate(object: any): Group;
    getObjects(): any[];
  }
}

interface CanvasProps {
  group_id: string;
  className?: string;
}

export default function Canvas({ group_id, className }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    items,
    currentTool,
    selectedItemId,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    setSelectedItemId,
  } = useCanvasStore();

  // Safely get canvas instance
  const getCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) {
      console.warn('Canvas not initialized');
      return null;
    }
    return canvas;
  };

  // Save object modifications to Supabase
  const saveObjectModification = async (obj: any) => {
    try {
      if (!obj?.data?.id) {
        console.warn('Invalid object modification:', obj);
        return;
      }

      const item = items.find(i => i.id === obj.data.id);
      if (!item) {
        console.warn('Item not found:', obj.data.id);
        return;
      }

      let updatedContent = { ...item.content };
      
      if (item.type === 'text' && obj instanceof IText) {
        updatedContent = {
          ...updatedContent,
          text: obj.text || ''
        };
      } else if (item.type === 'sticky-note' && obj instanceof Group) {
        const textObj = obj.getObjects()?.find((o) => o instanceof IText) as IText | undefined;
        if (textObj) {
          updatedContent = {
            ...updatedContent,
            text: textObj.text || ''
          };
        }
      } else if (item.type === 'task' && obj instanceof Group) {
        const titleObj = obj.getObjects()?.find((o) => o instanceof IText) as IText | undefined;
        const descObj = obj.getObjects()?.find((o) => o instanceof Text && o !== titleObj) as Text | undefined;
        if (titleObj || descObj) {
          updatedContent = {
            ...updatedContent,
            title: titleObj?.text || '',
            description: descObj?.text || ''
          };
        }
      }

      const { error: updateError } = await supabase
        .from('canvas_items')
        .update({
          position: { 
            x: typeof obj.left === 'number' ? obj.left : 0,
            y: typeof obj.top === 'number' ? obj.top : 0
          },
          content: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', obj.data.id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error saving object modification:', error);
      setError('Failed to save changes');
    }
  };

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      fabricRef.current = new FabricCanvas(canvasRef.current, {
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8,
        backgroundColor: '#ffffff',
        isDrawingMode: currentTool === 'drawing',
        preserveObjectStacking: true,
        stopContextMenu: true,
        selection: true,
        renderOnAddRemove: true
      });

      const canvas = getCanvas();
      if (!canvas) return;

      // Handle window resize
      const handleResize = () => {
        try {
          canvas.setWidth(window.innerWidth * 0.8);
          canvas.setHeight(window.innerHeight * 0.8);
          canvas.renderAll();
        } catch (error) {
          console.error('Error handling resize:', error);
        }
      };

      window.addEventListener('resize', handleResize);

      // Load existing items
      const loadItems = async () => {
        try {
          const { data, error } = await supabase
            .from('canvas_items')
            .select('*')
            .eq('group_id', group_id);

          if (error) throw error;
          if (!data) {
            console.warn('No items found');
            return;
          }

          setItems(data as AnyCanvasItem[]);

          // Convert items to Fabric.js objects
          data.forEach((item: AnyCanvasItem) => {
            try {
              let fabricObject: any = null;

              switch (item.type) {
                case 'text':
                  fabricObject = new IText(item.content.text || '', {
                    left: item.position.x || 0,
                    top: item.position.y || 0,
                    fontSize: item.content.fontSize || 16,
                    fill: item.content.color || '#000000',
                  });
                  break;
                case 'drawing':
                  if (!Array.isArray(item.content.paths)) {
                    console.warn('Invalid paths data:', item);
                    return;
                  }
                  const paths = item.content.paths.map((path) => {
                    if (!Array.isArray(path.points)) {
                      console.warn('Invalid path points:', path);
                      return null;
                    }
                    return new Path(path.points.map((p, i) => {
                      return `${i === 0 ? 'M' : 'L'} ${p.x || 0} ${p.y || 0}`;
                    }).join(' '), {
                      stroke: path.color || '#000000',
                      strokeWidth: path.width || 1,
                      fill: 'transparent',
                    });
                  }).filter((p): p is Path => p !== null);
                  
                  if (paths.length > 0) {
                    fabricObject = new Group(paths, {
                      left: item.position.x || 0,
                      top: item.position.y || 0,
                    });
                  }
                  break;
                case 'sticky-note':
                  const noteGroup = new Group();
                  const noteRect = new Rect({
                    width: 150,
                    height: 150,
                    fill: item.content.color || '#ffeb3b',
                    rx: 10,
                    ry: 10,
                  });
                  const noteText = new IText(item.content.text || '', {
                    fontSize: 14,
                    fill: '#000000',
                    width: 130,
                    left: 10,
                    top: 10,
                  });
                  noteGroup.addWithUpdate(noteRect);
                  noteGroup.addWithUpdate(noteText);
                  noteGroup.set({
                    left: item.position.x || 0,
                    top: item.position.y || 0,
                  });
                  fabricObject = noteGroup;
                  break;
                case 'task':
                  const taskGroup = new Group();
                  const taskBg = new Rect({
                    width: 200,
                    height: 100,
                    fill: '#f3f4f6',
                    rx: 5,
                    ry: 5,
                  });
                  const taskTitle = new IText(item.content.title || 'New Task', {
                    fontSize: 16,
                    fill: '#000000',
                    top: 10,
                    left: 10,
                  });
                  const taskDesc = new Text(item.content.description || '', {
                    fontSize: 12,
                    fill: '#6b7280',
                    top: 40,
                    left: 10,
                  });
                  taskGroup.addWithUpdate(taskBg);
                  taskGroup.addWithUpdate(taskTitle);
                  taskGroup.addWithUpdate(taskDesc);
                  taskGroup.set({
                    left: item.position.x || 0,
                    top: item.position.y || 0,
                  });
                  fabricObject = taskGroup;
                  break;
              }

              if (fabricObject) {
                fabricObject.data = { id: item.id };
                canvas.add(fabricObject);
              }
            } catch (error) {
              console.error('Error creating fabric object:', error, item);
            }
          });

          canvas.renderAll();
        } catch (error) {
          console.error('Error loading canvas items:', error);
          setError('Failed to load canvas items');
        }
      };

      loadItems();

      // Handle drawing path completion
      canvas.on('path:created', async (e: any) => {
        const path = e?.path;
        if (!path?.path) {
          console.warn('Invalid path data:', e);
          return;
        }

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.error('User not authenticated');
            setError('You must be logged in to draw');
            canvas.remove(path);
            return;
          }

          const pathData = {
            points: Array.isArray(path.path) ? path.path.map((cmd: any) => ({
              x: Number(cmd?.[1]) || 0,
              y: Number(cmd?.[2]) || 0
            })) : [],
            color: path.stroke || '#000000',
            width: Number(path.strokeWidth) || 1
          };

          const { data, error } = await supabase
            .from('canvas_items')
            .insert([{
              group_id,
              type: 'drawing',
              content: {
                paths: [pathData]
              },
              position: { 
                x: Number(path.left) || 0,
                y: Number(path.top) || 0
              },
              created_by: user.id,
              updated_by: user.id
            }])
            .select()
            .single();

          if (error) throw error;
          if (!data) throw new Error('No data returned');

          addItem(data as AnyCanvasItem);
          path.data = { id: data.id };
        } catch (error) {
          console.error('Error saving drawing:', error);
          canvas.remove(path);
          setError('Failed to save drawing');
        }
      });

      // Handle object modifications
      canvas.on('object:modified', (e: { target: any }) => {
        const obj = e?.target;
        if (!obj) {
          console.warn('No object modified:', e);
          return;
        }
        saveObjectModification(obj);
      });

      // Set up real-time subscription
      const subscription = supabase
        .channel(`canvas:${group_id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'canvas_items',
          filter: `group_id=eq.${group_id}`
        }, (payload) => {
          try {
            switch (payload.eventType) {
              case 'INSERT':
                addItem(payload.new as AnyCanvasItem);
                break;
              case 'UPDATE':
                updateItem(payload.new.id, payload.new as AnyCanvasItem);
                // Update Fabric.js object
                const updatedObj = canvas.getObjects()?.find((obj: any) => obj?.data?.id === payload.new.id);
                if (updatedObj) {
                  try {
                    updatedObj.set({
                      left: Number(payload.new.position.x) || 0,
                      top: Number(payload.new.position.y) || 0
                    });

                    if (updatedObj instanceof IText) {
                      updatedObj.set('text', payload.new.content.text || '');
                    } else if (updatedObj instanceof Group) {
                      const textObj = updatedObj.getObjects()?.find((o: any) => o instanceof IText);
                      if (textObj && payload.new.content.text) {
                        textObj.set('text', payload.new.content.text);
                      }

                      const titleObj = updatedObj.getObjects()?.find((o: any) => o instanceof IText);
                      const descObj = updatedObj.getObjects()?.find((o: any) => o instanceof Text && o !== titleObj);
                      if (titleObj && payload.new.content.title) {
                        titleObj.set('text', payload.new.content.title);
                      }
                      if (descObj && payload.new.content.description) {
                        descObj.set('text', payload.new.content.description);
                      }
                    }

                    canvas.renderAll();
                  } catch (error) {
                    console.error('Error updating object:', error);
                  }
                }
                break;
              case 'DELETE':
                deleteItem(payload.old.id);
                // Remove Fabric.js object
                const objToRemove = canvas.getObjects()?.find((obj: any) => obj?.data?.id === payload.old.id);
                if (objToRemove) {
                  try {
                    canvas.remove(objToRemove);
                    canvas.renderAll();
                  } catch (error) {
                    console.error('Error removing object:', error);
                  }
                }
                break;
            }
          } catch (error) {
            console.error('Error handling real-time update:', error);
          }
        })
        .subscribe();

      return () => {
        try {
          window.removeEventListener('resize', handleResize);
          canvas.dispose();
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error cleaning up canvas:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing canvas:', error);
      setError('Failed to initialize canvas');
    }
  }, [group_id]);

  // Update drawing mode when tool changes
  useEffect(() => {
    try {
      const canvas = getCanvas();
      if (!canvas) return;

      canvas.isDrawingMode = currentTool === 'drawing';
      if (currentTool === 'drawing') {
        canvas.freeDrawingBrush.width = 2;
        canvas.freeDrawingBrush.color = '#000000';
        canvas.freeDrawingBrush.strokeLineCap = 'round';
        canvas.freeDrawingBrush.strokeLineJoin = 'round';
      }

      // Disable selection when drawing
      canvas.selection = !canvas.isDrawingMode;
      canvas.forEachObject((obj: any) => {
        obj.selectable = !canvas.isDrawingMode;
        obj.evented = !canvas.isDrawingMode;
      });
    } catch (error) {
      console.error('Error updating drawing mode:', error);
    }
  }, [currentTool]);

  // Handle object selection
  useEffect(() => {
    try {
      const canvas = getCanvas();
      if (!canvas) return;
      
      canvas.on('selection:created', (e: any) => {
        const selected = e?.selected?.[0];
        if (selected?.data?.id) {
          setSelectedItemId(selected.data.id);
        }
      });

      canvas.on('selection:cleared', () => {
        setSelectedItemId(null);
      });
    } catch (error) {
      console.error('Error setting up selection handlers:', error);
    }
  }, []);

  if (error) {
    return (
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
        <div className={`relative ${className}`}>
          <canvas ref={canvasRef} className="border border-gray-200 rounded-lg shadow-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="border border-gray-200 rounded-lg shadow-lg" />
    </div>
  );
} 