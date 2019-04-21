import React, {Component} from "react";
import {Map, Marker, Popup, TileLayer} from 'react-leaflet'
import axios from "axios";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import chordMpr from "./utils";


class Route extends Component {

    constructor(props) {
        super(props);
        this.state = {
            airports: [],
            traffic: [],
            routes: []
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

        console.log(mpr.getMatrix());
        console.log(mpr.getMmap());
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
                    <div>
                        chord diagram of routes
                    </div>

                </div>


            </div>
        )
    }
}

export default Route;

