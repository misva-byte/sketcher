import type { BaseShape } from './BaseShape';

export interface Polyline extends BaseShape {
    type: 'polyline';
    points: Array<{
        x: number;
        y: number;
    }>;
}