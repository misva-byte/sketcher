import type { BaseShape } from './BaseShape';

export interface Ellipse extends BaseShape {
    type: 'ellipse';
    center: {
        x: number;
        y: number;
    };
    radiusX: number;
    radiusY: number;
}