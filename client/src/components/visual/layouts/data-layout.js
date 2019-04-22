import * as d3 from 'd3';
import Layout from "./layout";
import * as PIXI from "pixi.js";
const axisToLocation = {
    'Food & Beverage': {
        dataIndex: 3,
        key: 'food'
    },
    'polarity':{
        dataIndex: 0,
        key: 'polarity'
    },
    'Passenger Ratings':{
        dataIndex: 2,
        key: 'ratings'
    },
    'Wifi': {
        dataIndex: 9,
        key: 'wifi'
    },
    'Recommended': {
        dataIndex: 7,
        key: 'recommendedPercentage'
    },
    'score': {},
    'Seat Comfort': {
        dataIndex: 6,
        key: 'seatComfort'
    },
    'Entertainment': {
        dataIndex: 8,
        key: 'entertainment'
    },
    'Ground Service': {
        dataIndex: 4,
        key: 'ground'
    },
    'Cabin Crew': {
        dataIndex: 4,
        key: 'ground'
    },
    'Value':{
        dataIndex: 5,
        key: 'value'
    },
    'Departure Delay':{
        dataIndex: 10,
        key: 'avgDepDelay'
    },
    'Carrier Delay':{
        dataIndex: 11,
        key: 'carrierDelay'
    },
    'Late Aircraft Delays':{
        dataIndex: 12,
        key: 'lateAircraftDelay'
    },
    'Security Delays':{
        dataIndex: 13,
        key: 'securityDelay'
    },
    'Ratings':{
        dataIndex: -1,
        key: 'ratings'
    }
};


class DataLayout extends Layout {

    layout({xAxis, yAxis}) {
        const composer = this.composer;
        composer.clearLayoutHolder();
        let width = composer.getWidth();
        let height = composer.getHeight();
        composer.hideHeatMap();
        this.drawAxis();


        let xIndex = axisToLocation[xAxis]['dataIndex'];
        let xKey = axisToLocation[xAxis]['key'];
        let yIndex = axisToLocation[yAxis]['dataIndex'];
        let yKey = axisToLocation[yAxis]['key'];

        let xScale = d3.scaleLinear()
            .domain(d3.extent(composer.airlines, function (d) {
                return d.data[xIndex][xKey];
            }))
            .range([width/-2 + 50,width/2]);

        let yScale = d3.scaleLinear()
            .domain(d3.extent(composer.airlines, function (d) {
                return d.data[yIndex][yKey];
            }))
            .range([height/2 - 50, height/-2]);

        composer.airlines.forEach((airline) => {
            airline.props.alpha.set(1);
            airline.props.x.set(xScale(airline.data[xIndex][xKey]));
            airline.props.y.set(yScale(airline.data[yIndex][yKey]));
            airline.props.scale.set(.35);
        });
    }


    drawAxis(){
        let axisContainer = new PIXI.Container();
        let width = this.composer.getWidth();
        let height = this.composer.getHeight();

        this.composer.layoutHolder.addChild(axisContainer);

        this.xAxis = new PIXI.Graphics();
        this.xAxis.beginFill(0x000000, 0.46);
        this.xAxis.drawRect(
            -width / 2 ,
            height / 2 ,
            width ,
            2,
        );
        axisContainer.addChild(this.xAxis);

        this.yAxis = new PIXI.Graphics();
        this.yAxis.beginFill(0x000000, 0.6);
        this.yAxis.drawRect(
            -width / 2 ,
            -height / 2 ,
            2,
            height ,
        );
        axisContainer.addChild(this.yAxis);
    }

}

export default DataLayout;