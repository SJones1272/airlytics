import * as PIXI from 'pixi.js';
import AnimatedValue from "./AnimatedValue";
import airplane from "../../../static/airplane_icon.png";
import Color from 'color';

class Airline {

    constructor(props) {
        this.props = {
            x: new AnimatedValue(0),
            y: new AnimatedValue(0),
            alpha: new AnimatedValue(0),
            scale: new AnimatedValue(0),
            airplaneScale: new AnimatedValue(1),
        };

        this.renderScale = Math.max(0.1, Math.min(0.17, 0.17 * (window.innerWidth / 1600)));
        this.scale = 1;
        this.heatValues = [];
        this.active = false;

        Object.assign(this, props);
        this.initialize()
    }

    setActive = (value) => {
        this.active = value;
    };

    initialize() {
        const container = this.container = new PIXI.Container();
        this.airplane = new PIXI.Container();

        this.extra = new PIXI.Container();
        container.addChild(this.extra);

        this.heatmap = new PIXI.Container();
        this.extra.addChild(this.heatmap);

        container.alpha = 0;
        container.scale.x = 0;
        container.scale.y = 0;
        container.interactive = true;
        container.buttonMode = true;


        this.initializeAirplane();
        this.container.addChild(this.airplane);
    }

    setAirplaneInteractions() {
        this.airplane.on('pointerdown', event => {
            this.onAirplaneMouseDown(this);
        });

        this.airplane.on('pointerover', e => {
            this.onAirplaneHover(this);
        })

        this.airplane.on('pointerout', e => {
           this.onAirplaneHoverOut();
        })
    }


    initializeAirplane() {
        this.airplane.interactive = true;
        this.setAirplaneInteractions();

        let plane = PIXI.Sprite.fromImage(airplane);
        plane.anchor.set(.8);
        plane.tint = this.color;
        plane.position.y = 70;
        plane.scale.x = plane.scale.y = this.renderScale + .1;

        this.createAirplaneText(plane);

        this.airplane.addChild(plane);
    }

    createAirplaneText(plane) {
        this.airplaneText = new PIXI.Text(this.icao, {
            fontSize: 200,
            fontWeight: 'bolder',
            fill: this.color,
            align: 'center'
        });
        this.airplaneText.position.x = -356;
        this.airplaneText.position.y = -256;
        plane.addChild(this.airplaneText);
    }

    createHeatMap(width) {
        this.createHeatValues();

        let size = 315 * this.renderScale;
        this.heatmap.x = 30;
        this.heatmap.y = 0;
        let step = width / (this.data.length + 1);
        let x = -1;

        for (let i = 0, len = this.data.length, sprite; i < len; i++) {
            sprite = this.heatValues[i];
            sprite.x = i * step;
            sprite.y = -size / 2 + 10 / 2;
            sprite.scale.x = (step + (i === x ? step : 0)) / 8;
            sprite.scale.y = (size - 5) / 6;
            sprite._scale = sprite.scale.x;
        }
        this.showHeatMap()
    }

    createHeatValues() {
        if (this.heatValues.length === 0) {
            this.data.forEach((d) => {
                const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
                sprite.interactive = true;
                sprite.buttonMode = true;
                let key = Object.keys(d)[0];
                //TODO fix color schemes
                if(d[key] === 0){
                    sprite.tint = 0x613a51;
                }else {
                    let value = d[key];
                    if(key === 'polarity' || key === 'subjectivity'){
                        value = value * 5;
                    }
                    sprite.tint = Color(0x7851a9).mix(Color(this.color), value * .4).rgbNumber();
                }

                sprite.on('pointerover', e => {
                   this.onHeatMapHover([this.name, key, d[key]]);
                });

                sprite.on('pointerout', e => {
                    this.onHeatMapHoverOut();
                });

                sprite.on("pointerdown", e => {
                    this.onHeatMapClick([this.name, key]);
                });

                this.heatValues.push(sprite);
                this.heatmap.addChild(sprite);
            });
        }
    }

    hideHeatMap() {
        this.heatmap.visible = false;

    }

    showHeatMap() {
        this.heatmap.visible = true;
    }

    animate() {
        this.container.x = this.props.x.target;
        this.container.y = this.props.y.target;
        this.container.alpha = this.props.alpha.target;
        this.container.scale.x = this.container.scale.y = this.props.scale.target * this.scale;
        this.airplane.scale.x = this.airplane.scale.y = this.props.airplaneScale.target;
    }

}

export default Airline