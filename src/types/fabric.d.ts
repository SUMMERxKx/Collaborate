import { fabric } from 'fabric';

declare module 'fabric' {
  namespace fabric {
    interface Object {
      data?: {
        id: string;
      };
    }

    interface IText {
      text: string;
    }

    interface Group {
      getObjects(): Object[];
    }

    interface Path {
      path: any[];
      stroke: string;
      strokeWidth: number;
    }

    interface IEvent<T> {
      path?: Path;
      target?: Object;
      selected?: Object[];
    }
  }
}