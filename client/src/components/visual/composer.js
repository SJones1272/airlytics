import * as PIXI from 'pixi.js';
import Color from 'color';
import AnimatedValue from "./common/AnimatedValue";
import RankingLayout from "./layouts/ranking-layout";
import Airline from "./common/airline";
import AirplaneLayout from "./layouts/airplane-layout";
import DataLayout from "./layouts/data-layout";
import RouteLayout from "./layouts/route-layout";


class Composer {
    constructor(visual) {
        this.airlines = [];
        this.padding = 5;
        this.visual = visual;

        this.props = {
            envAlpha: new AnimatedValue(1, 0),
            axisAlpha: new AnimatedValue(1, 0),
        };

        const layoutOptions = {
            composer: this,
        };

        this.layouts = {
            ranking: new RankingLayout(layoutOptions),
            airline: new AirplaneLayout(layoutOptions),
            data: new DataLayout(layoutOptions),
            route: new RouteLayout(layoutOptions)
        };

        this.layout = null;

        this.initContainer();
    }

    resize() {
        this.container.removeChild(this.env);
        this.container.removeChild(this.dataHolder);

        this.initEnv();

        this.container.addChild(this.dataHolder);

        this.layout.reapply();
    }

    initContainer() {
        this.container = new PIXI.Container();
        this.initEnv();

        this.dataHolder = new PIXI.Container();
        this.container.addChild(this.dataHolder);

        this.layoutHolder = new PIXI.Container();
        this.container.addChild(this.layoutHolder);
    }

    initEnv() {
        this.env = new PIXI.Container();
        this.container.addChild(this.env);
    }

    load(data) {
        Object.values(data.airlines).forEach(airline => {
            airline.name = airline.airline;
            airline.color = Color(airline.color).rgbNumber();
            airline.onAirplaneMouseDown = this.onAirplaneMouseDown;
            airline.onAirplaneHover = this.onAirplaneHover;
            airline.onAirplaneHoverOut = this.onAirplaneHoverOut;

            airline.onHeatMapHover = this.onHeatMapHover;
            airline.onHeatMapHoverOut = this.onHeatMapHoverOut;
            airline.onHeatMapClick = this.onHeatMapClick;

            let airlineObject = new Airline(airline);
            this.airlines.push(airlineObject);
            this.dataHolder.addChild(airlineObject.container);
        });
    }

    setLayout(id, options) {
        this.layout = this.layouts[id];
        this.layout.apply(options);
    }

    clearLayoutHolder() {
        this.container.removeChild(this.layoutHolder);
        this.layoutHolder = new PIXI.Container();
        this.container.addChild(this.layoutHolder);
    }

    setSize(size) {
        this.airlines.forEach(c => {
            c.props.scale.set(size);
        });
    }

    getWidth() {
        let width = window.innerWidth;
        return width - (width * .15);
    }

    getHeight() {
        let height = window.innerHeight;
        return height - (height * .3);
    }

    rescale(size) {
        const heatmap = this.layout === this.layouts.heatmap;

        this.airlines.forEach(a => {
            a.scale = heatmap ? 1 : (2 + 1 / Math.pow(size, 2)) / 3;
        });
    }

    hideHeatMap() {
        this.airlines.forEach(airline => {
            airline.hideHeatMap();
        });
    }

    showHeatMap() {
        this.airlines.forEach(airline => {
            airline.showHeatMap();
        });
    }

    onAirplaneMouseDown = (airline) => {
        let options = {
            activeAirline: airline.name,
            layout: 'airline',
            activeVisual: 'airline',
            activeAirlineIata: airline.iata
        };

        this.visual.setState(options);
    }

    onAirplaneHover = (airline) => {
        this.visual.setState({
            airlineHover: true,
            name: airline.name
        })
    }

    onAirplaneHoverOut = () => {
        this.visual.setState({
            airlineHover: false
        })
    }


    onHeatMapHover = (values) => {
        this.visual.setState({
            airline: values[0],
            key: values[1],
            value: values[2],
            heatmapHover: true
        })
    }

    onHeatMapHoverOut = () => {
        this.visual.setState({
            heatmapHover: false
        })
    }

    onHeatMapClick = (values) => {

        this.visual.setState({
            activeVisual: 'data',
            activeAirline: values[0],
        })
        this.visual.setLayout('data', {
            xAxis: 'polarity',
            yAxis: 'Recommended'
        });
    }

    animate() {
        this.airlines.forEach(a => {
            a.animate();
        });
    }

}

export default Composer;
