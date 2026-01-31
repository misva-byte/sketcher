import type { Shape } from './ShapeManager'

export class FileManager {
    //save shapes to JSON string
    static save(shapes: Shape[]): string {
        return JSON.stringify(
            {
                version: 1,
                shapes
            },
            null,
            2   
        );
    }

    //load shapes from JSON string
    static load(json: string): Shape[] {
        const data = JSON.parse(json);

        if (!data || !Array.isArray(data.shapes)) {
            throw new Error('Invalid file fromat');
        }

        return data.shapes as Shape[];
    }
}