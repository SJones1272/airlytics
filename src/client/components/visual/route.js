import React, {Component} from "react";
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'

class Route extends Component{


    render(){
        return(
            <div style={{display: 'flex', position: 'fixed', width: '100%', height: '100%'}}>

                <div id="map">
                    <Map center={[40, -95]} zoom={4}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        />
                        <Marker position={[51.505, -0.09]}>
                            <Popup>A pretty CSS3 popup.<br />Easily customizable.</Popup>
                        </Marker>
                    </Map>
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

