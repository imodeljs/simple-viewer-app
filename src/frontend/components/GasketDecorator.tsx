import { DecorateContext, Marker, Decorator } from "@bentley/imodeljs-frontend";
import { GasketMarker } from "./GasketMarker";

export class GasketDecorator implements Decorator {
  protected _markers: Marker[] = [];

  constructor(info: any[]) {
    info.forEach( (component) => {
      if (component.position && component.status) this.addMarker(component);
    });
  }

  private addMarker(component: any) {
    const marker = new GasketMarker(
      { x: component.position.x, y: component.position.y, z: component.position.z },
      { x: 50, y: 50 },
      component.status,
    );
    this._markers.push(marker);
  }

  public decorate(context: DecorateContext): void {
      this._markers.forEach((marker) => {
        marker.addDecoration(context);
      });
  }
}
