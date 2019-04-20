import * as PIXI from "pixi.js"
import Viewport from 'pixi-viewport';
import Composer from "./composer";

class Visual {
    constructor(options) {
        Object.assign(this, options);
        this.initialize();
    }

    initialize() {
        this.createApplication();
        this.createView();
        this.initResize();
        this.createComposer();
    }


    createApplication() {
        this.app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor: 0x616161});

        document.getElementById('visualization').appendChild(this.app.view);

    }

    createView() {
        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: window.innerWidth,
            worldHeight: window.innerHeight,
            interaction: this.app.renderer.plugins.interaction,
        });

        this.viewport.clamp({direction: 'all', underflow: 'center'});
        this.viewport.clampZoom(Visual.getClampZoom());

        this.app.stage.addChild(this.viewport);

        this.viewport.on('zoomed', () => {
            this.composer.rescale(this.viewport.scale.x);
        });

        this.viewport.drag().wheel({smooth: 10});
    }

    static getClampZoom() {
        return {
            minWidth: 0.1 * window.innerWidth,
            minHeight: 0.1 * window.innerHeight,
            maxWidth: window.innerWidth,
            maxHeight: window.innerHeight,
        };
    }

    initResize() {
        window.addEventListener('resize', () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);

            this.viewport.resize(
                window.innerWidth,
                window.innerHeight,
                window.innerWidth,
                window.innerHeight,
            );

            this.viewport.clampZoom(Visual.getClampZoom());

            this.composer.container.x = window.innerWidth / 2;
            this.composer.container.y = window.innerHeight / 2;

            this.composer.resize();
        });
    }

    createComposer() {
        this.composer = new Composer(this);
        this.composer.container.x = window.innerWidth / 2;
        this.composer.container.y = window.innerHeight / 2;
    }

    load(data) {
        this.data = data;
        this.composer.load(data);
        this.viewport.addChild(this.composer.container);
    }

    setLayout(id, options = {}) {
        this.viewport.zoom(window.innerWidth);
        this.composer.setLayout(id, options);
    }

    start() {
        window.requestAnimationFrame(this.animate);
    }

    setAirline(name) {
        this.composer.airlines.forEach(airline => {
            airline.setActive(airline.name === name);
        });
    }

    animate = () => {
        this.composer.animate();

            window.requestAnimationFrame(this.animate);
    }
}

export default Visual;