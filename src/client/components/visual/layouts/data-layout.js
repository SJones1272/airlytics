// import * as PIXI from "pixi.js";
//
// initAxis(){
//     const size = 2;
//     this.xAxis = new PIXI.Graphics();
//     this.xAxis.beginFill(0x000000, 0.46);
//     this.xAxis.drawRect(
//         -w / 2 - this.padding,
//         h / 2 + this.padding,
//         w + this.padding * 2,
//         size,
//     );
//     this.env.addChild(this.xAxis);
//
//     this.yAxis = new PIXI.Graphics();
//     this.yAxis.beginFill(0x000000, 0.6);
//     this.yAxis.drawRect(
//         -w / 2 - this.padding,
//         -h / 2 - this.padding,
//         size,
//         h + this.padding * 2,
//     );
//     this.env.addChild(this.yAxis);
// }

import Layout from "./layout";

class DataLayout extends Layout{

    layout(){
        const composer = this.composer;
        composer.clearLayoutHolder();
        let width = composer.getWidth();
        composer.hideHeatMap();

        composer.airlines.forEach(airline => {
            airline.props.alpha.set(1);
        airline.props.scale.set(.25);
        })

    }

}

export default DataLayout;