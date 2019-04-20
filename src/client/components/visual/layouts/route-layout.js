import Layout from "./layout";
import * as PIXI from "pixi.js";

class RouteLayout extends Layout {
    layout({}) {
        console.log("ROUTE");

        this.composer.airlines.forEach(a => {
            a.props.alpha.set(0);
            a.props.x.set(-1000);
        })

        this.composer.hideHeatMap();

        let leafletContainer = new PIXI.Container();



        this.composer.layoutHolder.addChild(leafletContainer);

    }
}


export default RouteLayout;
