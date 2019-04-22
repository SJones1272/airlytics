import Layout from "./layout";
import * as PIXI from "pixi.js";

class RouteLayout extends Layout {
    layout({}) {

        //Just clears data - last page does not use pixi due to its content
        this.composer.clearLayoutHolder();
        this.composer.airlines.forEach(a => {
            a.props.alpha.set(0);
            a.props.x.set(-1000);
        })
        this.composer.hideHeatMap();

    }
}


export default RouteLayout;
