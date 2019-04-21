import React, {Component} from 'react';
import Header from "./header";
import Visual from "../visual/visual";
import data from "./airline-data"
import axios from "axios";

class App extends Component {

    constructor(props) {
        super(props);

        this.data = {
            airlines: data
        };

        this.rankings = ['Overall Score', 'Country', 'Sentiment', 'Recommended'];
        //TODO add rest
        this.dataAxis = ['Food & Beverage', 'Wifi', 'Recommended', 'Seat Comfort', 'Entertainment', "Ground Service", "Cabin Crew"];
        this.initialState = {
            layout: 'ranking',
            airline: '',
            x: 32,
            y: 5,
            z: 8,
            a: 0,
            rankingSortIndex: 0,
            xAxisIndex: 0,
            yAxisIndex: 6,
            showAbout: false,
            isHovering: false,
            activeVisual: "ranking",
            activeAirline: "american-airlines"
        };

        this.state = Object.assign({}, this.initialState);

        this.visual = new Visual({
            setState: this.setState.bind(this),
        });
    }

    updateRankingIndex = (value) => {
        let data = this.handleBounds(this.state.rankingSortIndex + value, this.rankings.length -1);
        this.setState({
            rankingSortIndex: data
        });
    };

    updateXDataIndex = (value) => {
        let data = this.handleBounds(this.state.xAxisIndex + value, this.dataAxis.length -1);
        this.setState({
            xAxisIndex: data
        });
    };

    updateYDataIndex = (value) => {
        let data = this.handleBounds(this.state.yAxisIndex + value, this.dataAxis.length -1);
        this.setState({
            yAxisIndex: data
        });
    };

    handleBounds = (value, upper) => {
        if(value > upper){
            return 0;
        }
        else if(value < 0){
            return upper;
        }else{
            return value;
        }
    };

    async componentDidMount() {
        this.visual.load(this.data);
        this.visual.start();
        window.addEventListener('resize', () => {
            this.forceUpdate();
        });

        this.refreshVisual();
    }

    componentDidUpdate() {
        this.refreshAirline();
        this.refreshVisual();
    }

    refreshVisual() {
        switch (this.state.layout) {
            case 'ranking':
                this.visual.composer.setSize(0.25);
                this.visual.setLayout('ranking', {
                    sort: this.rankings[this.state.rankingSortIndex]
                });
                this.visual.composer.container.interactive = true;
                break;
            case 'airline':
                this.visual.composer.setSize(0.25);
                this.visual.setLayout('airline', {
                    airline: this.state.activeAirline
                });
                this.visual.composer.container.interactive = true;
                break;
            case 'data':
                this.visual.composer.setSize(0.25);
                this.visual.setLayout('data', {
                    xAxis: this.dataAxis[this.state.xAxisIndex],
                    yAxis: this.dataAxis[this.state.yAxisIndex],
                });
                this.visual.composer.container.interactive = true;
                break;
            case 'route':
                this.visual.composer.setSize(0.25);
                this.visual.setLayout('route');
                this.visual.composer.container.interactive = false;
                break;
        }
    }

    refreshAirline() {
        this.visual.setAirline(this.state.airline);
    }

    setActive = (topic) => {
        this.setState({
            activeVisual: topic,
            layout: topic
        });
    };

    render() {
       if(this.state.isHovering) {
           console.log(this.state.key);
           console.log(this.state.airline);
           console.log(this.state.value);
       }
        return (
            <div className="app">

                <Header setActive={this.setActive} activeVisual={this.state.activeVisual}/>
                {this.state.activeVisual === 'ranking' ?
                    <div>
                        <div
                            className="label-x"
                        >
							<span
                                className="left icon-arrow-simple"
                                onClick={() => {
                                    this.updateRankingIndex(-1);
                                }}
                            />
                            <span
                                className="title"
                                style={{
                                    maxWidth: window.innerWidth - 100,
                                }}
                            >
                                {this.rankings[this.state.rankingSortIndex]}
							</span>
                            <span
                                className="right icon-arrow-simple"
                                onClick={() => {
                                   this.updateRankingIndex(1);
                                }}
                            />
                        </div>
                    </div> : <div></div>}

                {this.state.activeVisual === 'data' ?
                    <div>
                        <div
                            className="label-x"
                        >
							<span
                                className="left icon-arrow-simple"
                                onClick={() => {
                                    this.updateXDataIndex(-1)
                                }}
                            />
                            <span
                                className="title"
                                style={{
                                    maxWidth: window.innerWidth - 100,
                                }}
                            >
                                {this.dataAxis[this.state.xAxisIndex]}
							</span>
                            <span
                                className="right icon-arrow-simple"
                                onClick={() => {
                                    this.updateXDataIndex(1)
                                }}
                            />
                        </div>
                        <div
                            className="label-y"
                            style={{
                                right:
                                    window.innerWidth / 2 - 50
                            }}
                        >
							<span
                                className="left icon-arrow-simple"
                                onClick={() => {
                                    this.updateYDataIndex(-1)
                                }}

                            />
                            <span
                                className="title"
                                style={{
                                    maxWidth: window.innerWidth - 100,
                                }}
                            >
								{this.dataAxis[this.state.yAxisIndex]}
							</span>
                            <span
                                className="right icon-arrow-simple"
                                onClick={() => {
                                    this.updateYDataIndex(1)
                                }}
                            />
                        </div>
                    </div> : <div></div>}

                {this.state.activeVisual === 'route' ?
                    <div id="routes" style={ {visibility: "visible"}}>

                    </div> :
                    <div id="routes">
                    </div>
                }

            </div>
        );
    }
}

export default App;
