declare module "@mapbox/mapbox-gl-language" {
  import { Map, Plugin } from "mapbox-gl";
  export default class MapboxLanguage implements Plugin {
    constructor(options?: { defaultLanguage?: string });
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
  }
}
