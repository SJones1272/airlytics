import React, {Component} from "react";
import {Map, Marker, Popup, TileLayer} from 'react-leaflet'
import axios from "axios";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import chordMpr from "./utils";
import {ResponsiveChordCanvas} from "@nivo/chord";


class Route extends Component {

    constructor(props) {
        super(props);
        this.state = {
            airports: [],
            traffic: [],
            routes: [],
            matrix: [],
            mmp: {}
        }
    }

    async componentDidMount() {
        let results = await axios.get(`/api/routes/airline/${this.props.iata}/traffic`).catch(err => console.log(err));
        let airports = await axios.get("/api/airports").catch(err => console.log(err));
        let routes = await axios.get(`/api/routes/airline/${this.props.iata}`).catch(err => console.log(err));
        this.setState({
            airports: airports.data,
            traffic: results.data.data,
            routes: routes.data
        });

        this.generateChordMatrix();
    }

    generateChordMatrix() {
        let mpr = new chordMpr(this.state.routes);
        mpr.addValuesToMap('sourceAirport');
        mpr.addValuesToMap('destinationAirport');
        mpr.setFilter(function (row, a, b) {
            if (row.Source_airport_ID != "\N" && row.Destination_airport_ID != "\N") {
                return (row.Source_airport_ID === a.name && row.Destination_airport_ID === b.name)
            }
        })
            .setAccessor(function (recs, a, b) {
                if (!recs[0]) return 0;
                return 1;
            });

        this.setState({
            matrix: mpr.getMatrix(),
            mmp: mpr.getMmap()
        });
    }


    render() {
        return (
            <div style={{display: 'flex', position: 'fixed', width: '100%', height: '100%'}}>

                <div id="map">
                    {this.state.traffic.length === 0 ?
                        <Map center={[40, -95]} zoom={4}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                            />
                        </Map>
                        :
                        <Map center={[40, -95]} zoom={4}>
                            <HeatmapLayer
                                fitBoundsOnLoad
                                fitBoundsOnUpdate
                                points={this.state.traffic}
                                longitudeExtractor={m => {
                                    let airport = this.state.airports[m['airport']];
                                    return airport === undefined ? null : airport['longitude'];
                                }}
                                latitudeExtractor={m => {
                                    let airport = this.state.airports[m['airport']];
                                    return airport === undefined ? null : airport['latitude'];
                                }}
                                intensityExtractor={m => parseFloat(m['intensity'])}/>
                            <TileLayer
                                url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            />
                        </Map>
                    }
                </div>

                <div id="predictor">

                    <div>
                        <h1>Form</h1>
                    </div>
                    <div style={{width: '100%', height: '50%'}}>
                        chord diagram of routes
                        <ResponsiveChordCanvas
                            matrix={[[1, 2],[1, 2]]}
                            keys={["a", "b"]}
                            margin={{
                                "top": 60,
                                "right": 60,
                                "bottom": 60,
                                "left": 60
                            }}
                            pixelRatio={1}
                            padAngle={0.006}
                            innerRadiusRatio={0.86}
                            innerRadiusOffset={0}
                            arcOpacity={1}
                            arcBorderWidth={1}
                            arcBorderColor={{
                                "from": "color",
                                "modifiers": [
                                    [
                                        "darker",
                                        0.4
                                    ]
                                ]
                            }}
                            ribbonOpacity={0.5}
                            ribbonBorderWidth={1}
                            ribbonBorderColor={{
                                "from": "color",
                                "modifiers": [
                                    [
                                        "darker",
                                        0.4
                                    ]
                                ]
                            }}
                            enableLabel={true}
                            label="id"
                            labelOffset={9}
                            labelRotation={-90}
                            labelTextColor={{
                                "from": "color",
                                "modifiers": [
                                    [
                                        "darker",
                                        1
                                    ]
                                ]
                            }}
                            colors={{
                                "scheme": "paired"
                            }}
                            isInteractive={true}
                            arcHoverOpacity={1}
                            arcHoverOthersOpacity={0.4}
                            ribbonHoverOpacity={0.75}
                            ribbonHoverOthersOpacity={0}
                            animate={true}
                            motionStiffness={90}
                            motionDamping={7}
                        />
                    </div>

                </div>


            </div>
        )
    }
}

export default Route;

