import Layout from "./layout";
import data from "../../frame/airline-data"

class RankingLayout extends Layout {

    constructor(props){
        super(props)
        this.airlines = []
    }

    layout({ sort }) {
        console.log(sort);
        const composer = this.composer;
        composer.clearLayoutHolder();
        let width = composer.getWidth() + composer.padding;
        let height = composer.getHeight() + composer.padding;

        let cols = 7;
        let perCol = Math.ceil((composer.airlines.length) / cols);
        let colWidth = width / cols;
        let rowHeight = height / perCol;

        let padding = composer.padding/2;

        this.airlines = this.composer.airlines;
        this.sortAirlines(sort);

        this.airlines.forEach((airline, index) => {
            airline.props.alpha.set(1);
            airline.props.x.set(padding + width / -2 + Math.floor(index / perCol) * colWidth);
            airline.props.y.set(padding + height / -2 + (index % perCol) * rowHeight);

            let scale = rowHeight / (512 * airline.renderScale);
            airline.props.scale.set(scale);

            let heatMapWidth = (colWidth - 512 * airline.renderScale * scale) / scale;
            airline.createHeatMap(heatMapWidth);


        })
    }

    sortAirlines = (sort) => {
        switch(sort){
            case 'Country':
                this.sortAirlinesByCountry();
                break;
            case 'Recommended':
                this.sortAirlinesByRecommended();
                break;
            case 'Sentiment':
                this.sortAirlineBySentiment();
                break;
            default:
                this.sortAirlinesByScore();
        }
    }

    sortAirlinesByCountry = () => {
        this.airlines = this.airlines.slice().sort((a,b) => {
            return a.country > b.country ? -1 : 1;
        })
    }

    sortAirlinesByScore = () => {
        this.airlines = this.airlines.slice().sort((a,b) => {
            return a.score > b.score ? -1 : 1;
        })
    }

    //TODO fix buggy
    sortAirlinesByRecommended = () => {
        this.airlines = this.airlines.slice().sort((a,b) => {
            return a.data[7].recommendedPercentage > b.data[7].recommendedPercentage ? -1 : 1;
        })
    }

    sortAirlineBySentiment = () => {
        this.airlines = this.airlines.slice().sort((a,b) => {
            return a.data[0].polarity > b.data[0].polarity ? -1 : 1;
        })
    }


}

export default RankingLayout;