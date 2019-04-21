import React, {Component} from "react";
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import axios from "axios";
import HeatmapLayer from "react-leaflet-heatmap-layer";

class Route extends Component{

    constructor(props) {
        super(props);
        this.state = {
            airports: [],
            traffic: []
        }
    }

    async componentDidMount(){
        let traffic = await axios.get(`/api/routes/airline/${this.props.iata}/traffic`).catch(err => console.log(err));
        console.log(traffic);
        let airports = await axios.get("/api/airports").catch(err => console.log(err));
        this.setState({
            airports: airports.data,
            traffic: traffic.data.data
        });
    }


    render(){

        // let markers = this.state.airports.map(airport => <Marker position={[airport.latitude, airport.longitude]}>
        //         <Popup>A pretty CSS3 popup.<br />Easily customizable.</Popup>
        //     </Marker>
        // );

        return(
            <div style={{display: 'flex', position: 'fixed', width: '100%', height: '100%'}}>

                <div id="map">
                    {this.state.traffic.length === 0 ?
                        <Map center={[40, -95]} zoom={4}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                            />
                            {/*{markers}*/}
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
                        Results
                    </div>

                </div>


            </div>
        )
    }

}

export default Route;

