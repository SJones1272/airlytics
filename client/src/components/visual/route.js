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
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import Grid from "@material-ui/core/Grid/Grid";


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
            performance,
            mmp: {},
            keys: [],
            routes: [],
            routeLines: [],
            activeMap: 'performance',
            origin: 'DFW',
            destination: 'LAX',
            open: false,
            rankings: [],
            factors: {
                'seatComfort': .45,
                'entertainment': .21,
                'wifi': .21,
                'punctuality': .65,
                'polarity': .25,
                'food': .2,
                'ground': .05,
                'value': .71,
                'recommendedPercentage': .5
            }
        }

        this.find = this.find.bind(this);
    }

    async componentDidMount() {
        let results = await axios.get(`/api/routes/airline/${this.props.iata}/traffic`).catch(err => console.log(err));
        let airports = await axios.get("/api/airports").catch(err => console.log(err));
        let routes = await axios.get(`/api/routes/airline/${this.props.iata}`).catch(err => console.log(err));
        let performance = await axios.get(`api/performance/airline/${this.props.iata}`).catch(err => console.log(err));

        this.setState({
            airports: airports.data,
            traffic: results.data.data,
            routes: routes.data,
            performance: performance.data.data
        });

        this.generateRouteLines(routes.data);
        this.generateChordMatrix();
    }

    generateRouteLines = (routes) => {

        let routeLines = [];
        routes.data.forEach(route => {
            try {
                let source = this.state.airports[route.sourceAirport];
                let destination = this.state.airports[route.destinationAirport];
                routeLines.push([[source.latitude, source.longitude], [destination.latitude, destination.longitude]])
            } catch {

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

    handleChange = (e) => {
        this.setState({ factors: { ...this.state.factors, [e.target.id]: e.target.value} });

    }

    async find() {
        let results = await axios.post(`/api/airline/routes/${this.state.origin}-${this.state.destination}`, this.state.factors).catch(err => console.log(err));
        console.log(results);
        this.setState({
            rankings: (results.data).sort((a, b) => b.score - a.score)
        })

        console.log(this.state.routes);
    }

    changeActive = (map) => {
        this.setState({
            activeMap: map
        })
    };

    handleClickOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    changeRoute = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    }

    render() {
        const {classes} = this.props;

        return (
            <div>

                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Customize Route Algorithm Factors</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            What matters most to you? set your preferences below so we can best match you with an
                            airline for your trip.
                        </DialogContentText>
                        <Grid container spacing={24}>
                            <Grid item xs={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="seatComfort"
                                    value={this.state.factors.seatComfort}
                                    onChange={this.handleChange}
                                    label="Seat Comfort"
                                    type="number" inputProps={{min: "0", max: "1", step: ".1"}}
                                    helperText="Value between 0 and 1"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="entertainment"
                                    label="Entertainment"
                                    value={this.state.factors.entertainment}
                                    onChange={this.handleChange}
                                    type="number" inputProps={{min: "0", max: "1", step: ".1"}}
                                    helperText="Value between 0 and 1"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="wifi"
                                    label="Wifi Connectivity"
                                    value={this.state.factors.wifi}
                                    onChange={this.handleChange}
                                    type="number" inputProps={{min: "0", max: "1", step: ".1"}}
                                    helperText="Value between 0 and 1"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="punctuality"
                                    label="Punctuality"
                                    value={this.state.factors.punctuality}
                                    onChange={this.handleChange}
                                    type="number" inputProps={{min: "0", max: "1", step: ".1"}}
                                    helperText="Value between 0 and 1"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="polarity"
                                    label="Passenger Sentiment"
                                    value={this.state.factors.polarity}
                                    onChange={this.handleChange}
                                    type="number" inputProps={{min: "0", max: "1", step: ".1"}}
                                    helperText="Value between 0 and 1"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="food"
                                    label="Food"
                                    value={this.state.factors.food}
                                    onChange={this.handleChange}
                                    type="number" inputProps={{min: "0", max: "1", step: ".1"}}
                                    helperText="Value between 0 and 1"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="value"
                                    label="Value"
                                    value={this.state.factors.value}
                                    onChange={this.handleChange}
                                    type="number" inputProps={{min: "0", max: "1", step: ".1"}}
                                    helperText="Value between 0 and 1"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="recommendedPercentage"
                                    label="Recommended"
                                    value={this.state.factors.recommendedPercentage}
                                    onChange={this.handleChange}
                                    type="number" inputProps={{min: "0", max: "1", step: ".1"}}
                                    helperText="Value between 0 and 1"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="ground"
                                    label="Ground Service"
                                    value={this.state.factors.ground}
                                    onChange={this.handleChange}
                                    type="number" inputProps={{min: "0", max: "1", step: ".1"}}
                                    helperText="Value between 0 and 1"
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} variant="outlined" color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleClose} variant="outlined" color="primary">
                            save
                        </Button>
                    </DialogActions>
                </Dialog>


                <Typography variant="h5" gutterBottom style={{color: 'whitesmoke'}}>
                    Currently Exploring: {this.props.airline}
                </Typography>
                <div style={{display: 'flex', position: 'fixed', width: '100%', height: '100%'}}>

                    {/*<div id="map" style={{*/}
                    {/*borderStyle: 'solid',*/}
                    {/*borderColor: 'whitesmoke',*/}
                    {/*borderRadius: 10,*/}
                    {/*}}>*/}
                    <div id="map">
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

                                {this.state.activeMap === 'performance' ?
                                    <HeatmapLayer
                                        fitBoundsOnLoad
                                        fitBoundsOnUpdate
                                        points={this.state.performance}
                                        longitudeExtractor={m => {
                                            let airport = this.state.airports[m['source']];
                                            return airport === undefined ? null : airport['longitude'];
                                        }}
                                        latitudeExtractor={m => {
                                            let airport = this.state.airports[m['source']];
                                            return airport === undefined ? null : airport['latitude'];
                                        }}
                                        intensityExtractor={m => parseFloat(m['avgDepDelay'])}/> : null}

                                <TileLayer
                                    attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                                    url='https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
                                />

                                {this.state.activeMap === 'routes' ?
                                    <Polyline color="#22bc2b" opacity="0.1" style={{lineWidth: '.5px'}}
                                              positions={this.state.routeLines}/> : null}

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
                                    id="origin"
                                    label="Origin"
                                    className={classes.textField}
                                    margin="normal"
                                    variant="outlined"
                                    onChange={this.changeRoute}
                                    value={this.state.origin}
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
                                    id="destination"
                                    label="Destination"
                                    className={classes.textField}
                                    margin="normal"
                                    variant="outlined"
                                    onChange={this.changeRoute}
                                    value={this.state.destination}
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
                            <Button color="secondary" variant="contained" style={{marginRight: 10}}
                                    onClick={this.handleClickOpen}>
                                Customize Factors
                            </Button>
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
                                borderColor: 'whitesmoke',
                                marginRight: '5px',
                                borderRadius: 10
                            }}>
                                <Typography color="inherit" variant="h5" gutterBottom style={{color: '#22bc2b'}}>
                                    Route Results
                                </Typography>
                                <Typography color="inherit" variant="h6" gutterBottom style={{color: '#22bc2b'}}>
                                    Origin: {this.state.origin} - Destination: {this.state.destination}
                                </Typography>

                                {console.log(this.state.rankings)}
                                <ul style={{textAlign: "left", color:"whitesmoke"}}>
                                    {this.state.rankings.map(x => <li>{x.iata} - {x.score}</li>)}
                                </ul>
                            </div>
                            <div style={{
                                width: '60%',
                                height: '80%',
                                textAlign: 'center',
                                borderStyle: 'solid',
                                borderColor: 'whitesmoke',
                                borderRadius: 10
                            }}>
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
                                            "bottom": 90,
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

