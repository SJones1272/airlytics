import React, {Component} from "react";
import {Map, Marker, Polyline, Popup, TileLayer} from 'react-leaflet'
import axios from "axios";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import chordMpr from "./utils";
import {ResponsiveChordCanvas} from "@nivo/chord";
import {ClipLoader, RingLoader} from "react-spinners";
import withStyles from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button/Button";
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
        width: 200,
    },

    cssLabel: {
        color: '#22bc2b'
    },

    cssOutlinedInput: {
        '&$cssFocused $notchedOutline': {
            borderColor: `${theme.palette.primary.main} !important`,
        }
    },

    cssFocused: {},

    notchedOutline: {
        borderWidth: '1px',
        borderColor: 'whitesmoke !important'
    },
    multilineColor: {
        color: 'red'
    }
});

class Route extends Component {

    constructor(props) {
        super(props);
        this.state = {
            airports: [],
            traffic: [],
            matrix: [],
            mmp: {},
            keys: [],
            routes: [],
            routeLines: [],
            activeMap: 'traffic'
        }
    }

    handleChange = (event, value) => {
        this.setState({value});
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

        this.generateRouteLines(routes.data);
        this.generateChordMatrix();
    }

    generateRouteLines = (routes) => {

        let routeLines = [];
            console.log(this.state.airports['ABE']);
        routes.data.forEach(route => {
            try {
                let source = this.state.airports[route.sourceAirport];
                let destination = this.state.airports[route.destinationAirport];
                routeLines.push([[source.latitude, source.longitude], [destination.latitude, destination.longitude]])
            }catch{

            }
        });

        this.setState({
            routeLines: routeLines
        })

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

        this.setState({
            matrix: matrix,
            keys: keys,
        });

    }

    find = () => {
        alert("FOUND");
    }

    changeActive = (map) => {
        this.setState({
            activeMap: map
        })
    };


    render() {
        const {classes} = this.props;
        const polyline = [[51.505, -0.09], [51.51, -0.1]]
        const multiPolyline = [
            [[51.5, -0.1], [51.5, -0.12], [51.52, -0.12]],
            [[51.5, -0.05], [51.5, -0.06], [51.52, -0.06]],
        ]

        return (
            <div>
                <Typography variant="h5" gutterBottom style={{color: 'whitesmoke'}}>
                    Currently Exploring: {this.props.airline}
                </Typography>
                <div style={{display: 'flex', position: 'fixed', width: '100%', height: '100%'}}>

                    <div id="map" style={{pointerEvents: 'auto'}}>

                        {this.state.traffic.length === 0 ?
                            <div style={{position: 'fixed', 'top': '30%', left: '5%'}}>
                                <RingLoader
                                    css={override}
                                    sizeUnit={"px"}
                                    size={'300'}
                                    color={'#22bc2b'}
                                    loading={true}
                                />
                            </div>
                            :
                            <Map center={[40, -95]} zoom={4}>
                                {this.state.activeMap === 'traffic' ?
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
                                        intensityExtractor={m => parseFloat(m['intensity'])}/> : null}
                                <TileLayer
                                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                />

                                {this.state.activeMap === 'routes' ?
                                    <Polyline color="lime" opacity="0.6" style={{lineWidth: '1px'}}positions={this.state.routeLines}/> : null}


                                <Control position="topright">
                                    <Button color={this.state.activeMap === 'performance' ? 'secondary' : 'default'}
                                            variant="contained"
                                            onClick={() => this.changeActive('performance')}
                                    >
                                        Performance
                                    </Button>
                                    <Button color={this.state.activeMap === 'traffic' ? 'secondary' : 'default'}
                                            variant="contained"
                                            onClick={() => this.changeActive('traffic')}
                                    >
                                        Traffic
                                    </Button>
                                    <Button color={this.state.activeMap === 'routes' ? 'secondary' : 'default'}
                                            variant="contained"
                                            onClick={() => this.changeActive('routes')}
                                    >
                                        Routes
                                    </Button>
                                </Control>

                            </Map>
                        }
                    </div>

                    <div id="predictor">

                        <div style={{textAlign: "center", color: 'whitesmoke', marginBottom: '10px'}}>
                            <Typography color="inherit" variant="h3" gutterBottom>
                                Route Explorer
                            </Typography>
                            <Typography color="inherit" variant="subtitle1" gutterBottom>
                                Find the best airline for a specific trip based on your preferences!
                            </Typography>
                            <form className={classes.container} noValidate autoComplete="off">
                                <TextField
                                    id="outlined-name"
                                    label="Origin"
                                    className={classes.textField}
                                    margin="normal"
                                    variant="outlined"
                                    InputLabelProps={{
                                        classes: {
                                            root: classes.cssLabel,
                                            focused: classes.cssFocused,
                                        },
                                    }}
                                    InputProps={{
                                        classes: {
                                            root: classes.cssOutlinedInput,
                                            focused: classes.cssFocused,
                                            notchedOutline: classes.notchedOutline,
                                        }
                                    }}
                                />
                                <TextField
                                    id="outlined-uncontrolled"
                                    label="Destination"
                                    className={classes.textField}
                                    margin="normal"
                                    variant="outlined"
                                    InputLabelProps={{
                                        classes: {
                                            root: classes.cssLabel,
                                            focused: classes.cssFocused,
                                        },
                                    }}
                                    InputProps={{
                                        classes: {
                                            root: classes.cssOutlinedInput,
                                            focused: classes.cssFocused,
                                            notchedOutline: classes.notchedOutline,
                                        }
                                    }}
                                />
                            </form>
                            <Button variant="contained" color="primary" onClick={this.find}>
                                Explore
                            </Button>
                        </div>

                        <div id="results" style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
                            <div style={{
                                width: '40%',
                                height: '80%',
                                textAlign: 'center',
                                borderStyle: 'solid',
                                marginRight: '5px',
                                borderRadius: 10
                            }}>
                                <Typography color="inherit" variant="h5" gutterBottom style={{color: '#22bc2b'}}>
                                    Route Results
                                </Typography>
                                <Typography color="inherit" variant="h6" gutterBottom style={{color: '#22bc2b'}}>
                                    Origin: DFW - Destination: ATL
                                </Typography>
                            </div>
                            <div style={{width: '60%', height: '80%', textAlign: 'center', borderStyle: 'solid', borderRadius: 10}}>
                                <Typography color="inherit" variant="h5" gutterBottom style={{color: '#22bc2b'}}>
                                    {this.props.airline} Route Connections
                                </Typography>
                                {this.state.keys.length !== 0 ?
                                    <ResponsiveChordCanvas
                                        matrix={this.state.matrix.slice(0, 100)}
                                        keys={this.state.keys.slice(0, 100)}
                                        margin={{
                                            "top": 60,
                                            "right": 60,
                                            "bottom": 150,
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
                                    /> :
                                    <div style={{position: 'fixed', 'top': '50%', 'right': '7%'}}>
                                        <RingLoader
                                            css={override}
                                            sizeUnit={"px"}
                                            size={'350'}
                                            color={'#22bc2b'}
                                            loading={true}
                                        />
                                    </div>
                                }
                            </div>
                        </div>

                    </div>


                </div>
            </div>)
    }
}

export default withStyles(styles)(Route);

