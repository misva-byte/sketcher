export type ShapeType = 'line' | 'circle' | 'ellipse' | 'polyline' ;

export interface BaseShape {
    id: string;
    type: ShapeType;
    color: string;
    visible: boolean;
}