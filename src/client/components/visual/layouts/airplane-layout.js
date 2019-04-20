import Layout from "./layout";
import * as PIXI from "pixi.js";
import airplane from "../../../static/american.png";

class AirplaneLayout extends Layout {
    layout({airline}) {
        const composer = this.composer;
        let width = composer.getWidth() + composer.padding;
        let height = composer.getHeight() + composer.padding;

        composer.airlines.forEach(a => {
            if (a.name != airline) {
                a.props.alpha.set(0);
            } else {
                a.props.alpha.set(1);
                console.log(a);
                let launchContainer = new PIXI.Container();
                this.airplaneText = new PIXI.Text(a.name, {
                    fontSize: '600%',
                    fontWeight: 'bold',
                    fill: a.color
                });
                this.airplaneText.anchor.set(.5);
                this.airplaneText.position.y = -height / 2 + 100;
                launchContainer.addChild(this.airplaneText);

                const plane = PIXI.Sprite.fromImage(airplane);
                plane.position.y = -height / 2 + 300;
                plane.anchor.set(0.5);
                plane.scale.x = plane.scale.y = 1.4;

                launchContainer.addChild(plane);
                composer.layoutHolder.addChild(launchContainer);
                a.props.y.set(height / -2 + 600);
                a.props.x.set(width / -2 + 300);
                a.props.scale.set(width / 1200);
                a.showHeatMap();
            }
        })
    }

}

export default AirplaneLayout;