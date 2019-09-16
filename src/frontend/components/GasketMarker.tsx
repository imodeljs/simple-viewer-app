import { Marker, imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { XYAndZ, XAndY } from "@bentley/geometry-core";

const statusToUrl = new Map<string, string>([
  ["YES", "map_pin_green.svg"],
  ["NO", "map_pin_red.svg"],
  ["OPEN ENDED", "map_pin_yellow.svg"],
]);

export class GasketMarker extends Marker {
    constructor(worldLocation: XYAndZ, size: XAndY, status: string) {
      super(worldLocation, size);
      const imageUrl = statusToUrl.get(status);
      if (imageUrl) this.setImage(imageElementFromUrl(imageUrl));
    }
  }
