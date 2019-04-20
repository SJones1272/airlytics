import * as d3 from 'd3';

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
        let height = composer.getHeight();
        composer.hideHeatMap();


        let xScale = d3.scaleLinear()
            .domain(d3.extent(composer.airlines, function(d) { return d.data[3].food; }))
            .range([width/-2, width/2 - 850]);

        let yScale = d3.scaleLinear()
            .domain(d3.extent(composer.airlines, function(d) { return d.score; }))
            .range([height/-2, height]);

        composer.airlines.forEach((airline, index) => {
            console.log(airline.data[2].ratings);
            airline.props.alpha.set(1);
            var num = (airline.score); // this will get a number between 1 and 99;
            airline.props.x.set(xScale(num));
            airline.props.y.set(yScale(airline.data[2].ratings));
        airline.props.scale.set(.25);
        })


    }

}

export default DataLayout;