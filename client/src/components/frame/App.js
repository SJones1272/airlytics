import React, {Component} from 'react';
import Header from "./header";
import Visual from "../visual/visual";
import data from "./airline-data"
import axios from "axios";
import Route from "../visual/route";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
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
            heatmapHover: false,
            activeVisual: "ranking",
            activeAirline: "american-airlines",
            activeAirlineIata: 'AA'
        }

        this.data = {
            airlines: data
        };

        this.rankings = ['Overall Score', 'Country', 'Sentiment', 'Recommended'];
        //TODO add rest
        this.dataAxis = ['Food & Beverage', 'Wifi', 'Recommended', 'Seat Comfort', 'Entertainment', "Ground Service", "Cabin Crew"];

        this.visual = new Visual({
            setState: this.setState.bind(this),
        });


    }

    updateRankingIndex = (value) => {
        let data = this.handleBounds(this.state.rankingSortIndex + value, this.rankings.length - 1);
        this.setState({
            rankingSortIndex: data
        });
    };

    updateXDataIndex = (value) => {
        let data = this.handleBounds(this.state.xAxisIndex + value, this.dataAxis.length - 1);
        this.setState({
            xAxisIndex: data
        });
    };

    updateYDataIndex = (value) => {
        let data = this.handleBounds(this.state.yAxisIndex + value, this.dataAxis.length - 1);
        this.setState({
            yAxisIndex: data
        });
    };

    handleBounds = (value, upper) => {
        if (value > upper) {
            return 0;
        }
        else if (value < 0) {
            return upper;
        } else {
            return value;
        }
    };

    async componentDidMount() {
        this.visual.load(this.data);
        this.visual.start();
        window.addEventListener('resize', () => {
            this.forceUpdate();
        });

        document.getElementById("visualization").addEventListener('mousemove', e => {
            this.setState({_hoverX: e.pageX, _hoverY: e.pageY});
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
        const displayHeatHoverDiv = (this.state.activeVisual === 'ranking' || this.state.activeVisual === 'airline') && this.state.heatmapHover;
        const displayAirlineHoverDiv = this.state.activeVisual !== 'route' && this.state.airlineHover;
        return (
            <div className="app">

                {displayHeatHoverDiv ? <div style={{position: 'fixed', backgroundColor: 'rgba(255,255,0,0.8)',  fontSize: 20, pointerEvents: 'none', top: this.state._hoverY, left: this.state._hoverX}}>{this.state.key} - {this.state.value}</div> : null}
                {displayAirlineHoverDiv ? <div style={{position: 'fixed', backgroundColor: 'rgba(255,255,0,0.8)',  fontSize: 20, pointerEvents: 'none', top: this.state._hoverY, left: this.state._hoverX}}>{this.state.name} </div> : null}
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
                    </div> : null}


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
                    </div> : null}

                {this.state.activeVisual === 'route' ?
                    <div id="routes" style={{visibility: "visible"}}>
                        <Route airline={this.state.activeAirline} iata={this.state.activeAirlineIata}/>
                    </div> : null
                }

            </div>
        );
    }
}

export default App;
