import { fabric } from 'fabric';

declare module 'fabric' {
  namespace fabric {
    interface Object {
      data?: {
        id: string;
      };
      left?: number;
      top?: number;
      selectable?: boolean;
      evented?: boolean;
      set(key: string | Record<string, any>, value?: any): this;
    }

    interface IText extends Object {
      text: string;
    }

    interface Group extends Object {
      getObjects(): Object[];
      addWithUpdate(object: Object): this;
    }

    interface Path extends Object {
      path: any[];
      stroke: string;
      strokeWidth: number;
    }

    interface IEvent<T> {
      path?: Path;
      target?: Object;
      selected?: Object[];
      e?: MouseEvent;
    }

    interface Canvas {
      isDrawingMode: boolean;
      freeDrawingBrush: {
        width: number;
        color: string;
        strokeLineCap: string;
        strokeLineJoin: string;
      };
      selection: boolean;
      forEachObject(callback: (obj: Object) => void): void;
      renderAll(): void;
      dispose(): void;
      on(event: string, handler: (e: IEvent<any>) => void): void;
      add(object: Object): void;
      remove(object: Object): void;
      getObjects(): Object[];
      setWidth(width: number): void;
      setHeight(height: number): void;
    }
  }
}