import Layout from "./layout";
import data from "../../frame/airline-data"

class RankingLayout extends Layout {
    layout() {
        const composer = this.composer;
        composer.clearLayoutHolder();
        let width = composer.getWidth() + composer.padding;
        let height = composer.getHeight() + composer.padding;

        let cols = 7;
        let perCol = Math.ceil((composer.airlines.length) / cols);
        let colWidth = width / cols;
        let rowHeight = height / perCol;

        let padding = composer.padding/2;


        this.composer.airlines.forEach((airline, index) => {
            airline.props.alpha.set(1);
            airline.props.x.set(padding + width / -2 + Math.floor(index / perCol) * colWidth);
            airline.props.y.set(padding + height / -2 + (index % perCol) * rowHeight);

            let scale = rowHeight / (512 * airline.renderScale);
            airline.props.scale.set(scale);

            let heatMapWidth = (colWidth - 512 * airline.renderScale * scale) / scale;
            airline.createHeatMap(heatMapWidth);


        })
    }
}

export default RankingLayout;