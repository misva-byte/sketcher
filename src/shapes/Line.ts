// src/shapes/Line.ts

import type { BaseShape } from './BaseShape';

export interface Line extends BaseShape {
  type: 'line';
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
}
