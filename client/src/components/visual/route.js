import React, {Component} from "react";
import {Map, Marker, Popup, TileLayer} from 'react-leaflet'
import axios from "axios";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import chordMpr from "./utils";
import {ResponsiveChordCanvas} from "@nivo/chord";
import {ClipLoader, RingLoader} from "react-spinners";
import withStyles from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button/Button";
import Slider from '@material-ui/lab/Slider';
import Typography from "@material-ui/core/Typography/Typography";
import Control from 'react-leaflet-control';


const override = {
    display: 'flex',
    justifyContent: 'center',
};

const styles = theme => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    dense: {
        marginTop: 16,
    },
    menu: {
        width: 200,
    },
    slider: {
        margin: 'auto'
    }
});

class Route extends Component {

    constructor(props) {
        super(props);
        this.state = {
            airports: [],
            traffic: [],
            routes: [],
            matrix: [],
            mmp: {},
            keys: [],
        }
    }

    handleChange = (event, value) => {
        this.setState({ value });
    };

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
        let keys = [];
        let mmap = mpr.getMmap();
        Object.keys(mmap).forEach(key => {
            keys.push(mmap[key]['name'])
        });

        let matrix = []
        mpr.getMatrix().forEach(x => {
            matrix.push(x);
        })

        console.log(keys);
        this.setState({
            matrix: matrix,
            keys: keys
        });

        console.log(this.state.matrix[0]);
    }

    find = () => {
        alert("FOUND");
    }


    render() {
        const { classes } = this.props;
        return (
            <div >
                <Typography variant="h5" gutterBottom style={{color:'red'}}>
                    Currently Exploring: {this.props.iata}
                </Typography>
            <div style={{display: 'flex', position: 'fixed', width: '100%', height: '100%'}}>

                <div id="map">

                    {this.state.traffic.length === 0 ?
                        <RingLoader
                            css={override}
                            sizeUnit={"px"}
                            size={'300'}
                            color={'#123abc'}
                            loading={true}
                        />
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

                            <Control position="topright" >
                                <Button color="primary" variant="contained"
                                        onClick={ () => alert("YES") }
                                >
                                    Performance
                                </Button>
                                <Button color="secondary" variant="contained"
                                        onClick={ () => alert("YES") }
                                >
                                    Traffic
                                </Button>
                                <Button color="primary" variant="contained"
                                        onClick={ () => alert("YES") }
                                >
                                    Routes
                                </Button>
                            </Control>

                        </Map>
                    }
                </div>

                <div id="predictor">

                    <div style={{textAlign: "center"}}>
                        <Typography variant="h3" gutterBottom>
                           Route Explorer
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Find the best airline for a specific trip based on your preferences!
                        </Typography>
                        <form className={classes.container} noValidate autoComplete="off">
                            <TextField
                                id="outlined-name"
                                label="Origin"
                                className={classes.textField}
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                id="outlined-uncontrolled"
                                label="Destination"
                                className={classes.textField}
                                margin="normal"
                                variant="outlined"
                            />
                        </form>
                        <Button variant="contained" color="primary" onClick={this.find}>
                            Explore
                        </Button>
                    </div>
                    <div style={{width: '50%', height: '50%'}}>
                        {this.state.keys.length !== 0 ?
                            <ResponsiveChordCanvas
                                matrix={this.state.matrix.slice(0,100)}
                                keys={this.state.keys.slice(0,100)}
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
                                ribbonOpacity={0.8}
                                ribbonBorderWidth={10}
                                ribbonBorderColor={{
                                    "from": "color",
                                    "modifiers": [
                                        [
                                            "darker",
                                            0.6
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
                                ribbonHoverOpacity={1}
                                ribbonHoverOthersOpacity={0}
                                animate={true}
                                motionStiffness={90}
                                motionDamping={7}
                            /> : <RingLoader
                                css={override}
                                sizeUnit={"px"}
                                size={'300'}
                                color={'#123abc'}
                                loading={true}
                                />
                        }
                    </div>

                </div>


            </div>
            </div>)
    }
}

export default withStyles(styles)(Route);

