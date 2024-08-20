declare module 'react-virtuoso' {
    import * as React from 'react';
  
    export interface TableVirtuosoProps<T> {
      data: T[];
      components?: TableComponents<T>;
      fixedHeaderContent?: React.ReactNode;
      itemContent: (index: number, item: T) => React.ReactNode;
    }
  
    export interface TableComponents<T> {
      Scroller?: React.ComponentType<any>;
      Table?: React.ComponentType<any>;
      TableHead?: React.ComponentType<any>;
      TableRow?: React.ComponentType<any>;
      TableBody?: React.ComponentType<any>;
    }
  
    export const TableVirtuoso: React.FC<TableVirtuosoProps<any>>;
  }
  