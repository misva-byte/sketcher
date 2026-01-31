import type { BaseShape } from './BaseShape';

export interface Circle extends BaseShape {
    id: string
    type: 'circle';
    center: {
        x: number;
        y: number;
    };
    radius: number;
    color: string
    visible: boolean
}
