const express = require('express');
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    hosts: ['http://24.2.97.148:9200']
});

let router = express.Router();

router.get("/airline/:iata", async function (req, res) {
    let results = await retrieveAirlinePerformance(req.params['iata'].toUpperCase());
    console.log(Object.keys(results).length);
    res.send(results)
});

router.get("/airline/:iata/:from-:to", async function(req, res){
    let results = await retireveAirlineRoutePerformance(req.params['iata'], req.params['from'], req.params['to']);

    res.send(results)
});

router.get("/airline/:iata/date", async function (req, res) {
    let year = req.query.year;
    let month = req.query.month;

    if (!year) {
        throw new FetchError();
    }

    let results = {};
    if (!month) {
        results = await retrieveAirlinePerformanceByYear(req.params['iata'].toUpperCase(), year);
    }
    else {
        results = await retrieveAirlinePerformanceByYearAndMonth(req.params['iata'].toUpperCase(), year, month);
    }

    res.send(results);
});

async function retireveAirlineRoutePerformance(airlineCode, origin, destination){
    let elasticResults = await client.search({
        index: 'ontimeperformance',
        type: 'ontimeperformance',
        body: {
            size: "12",
            query: {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "reporting_Airline.keyword": `${airlineCode}`
                            }
                        }, {
                            "match": {
                                "year": `${year}`
                            }
                        }, {
                            "match": {
                                "month": `${month}`
                            }
                        },
                        {
                            "range": {
                                "depDelay": {
                                    "gt": 0
                                }
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "airlinesAgg": {
                    "terms": {
                        "field": "reporting_Airline.keyword"
                    },
                    "aggs": {
                        "originAgg": {
                            "terms": {
                                "field": "origin.keyword",
                                "size": 550,
                                "order": {
                                    "_term": "asc"
                                }
                            },
                            "aggs": {
                                "destinationAgg": {
                                    "terms": {
                                        "field": "dest.keyword",
                                        "size": 550
                                        , "order": {
                                            "_term": "asc"
                                        }
                                    },
                                    "aggs": {
                                        "departureDelay": {
                                            "avg": {
                                                "field": "depDelay"
                                            }
                                        },
                                        "arrivalDelay": {
                                            "avg": {
                                                "field": "arrDelay"
                                            }
                                        },
                                        "carrierDelay": {
                                            "avg": {
                                                "field": "carrierDelay"
                                            }
                                        },
                                        "lateAircraftDelay": {
                                            "avg": {
                                                "field": "lateAircraftDelay"
                                            }
                                        },
                                        "securityDelay": {
                                            "avg": {
                                                "field": "securityDelay"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }).catch(err => console.log(err));
    let data = elasticResults.aggregations.airlinesAgg.buckets[0].originAgg.buckets;

    let results = {
        "iata": airlineCode,
        "origin": year,
        "destination": month
    }
    for (let i = 0; i < data.length; i++) {
        let destinations = data[i].destinationAgg.buckets;
        let destinationEntries = []
        for (let j = 0; j < destinations.length; j++) {
            let destination = {
                "destination": destinations[j].key,
                "avgDepDelay": (destinations[j].arrivalDelay.value).toFixed(2),
                "lateAircraftDelay": (destinations[j].lateAircraftDelay.value).toFixed(2),
                "securityDelay": (destinations[j].securityDelay.value).toFixed(2),
                "carrierDelay": (destinations[j].carrierDelay.value).toFixed(2)
            }
            destinationEntries.push(destination)
        }
        results[data[i].key] = destinationEntries
    }
    return results
}

async function retrieveAirlinePerformanceByYearAndMonth(airlineCode, year, month) {
    let elasticResults = await client.search({
        index: 'ontimeperformance',
        type: 'ontimeperformance',
        body: {
            size: "12",
            query: {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "reporting_Airline.keyword": `${airlineCode}`
                            }
                        }, {
                            "match": {
                                "year": `${year}`
                            }
                        }, {
                            "match": {
                                "month": `${month}`
                            }
                        },
                        {
                            "range": {
                                "depDelay": {
                                    "gt": 0
                                }
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "airlinesAgg": {
                    "terms": {
                        "field": "reporting_Airline.keyword"
                    },
                    "aggs": {
                        "originAgg": {
                            "terms": {
                                "field": "origin.keyword",
                                "size": 550,
                                "order": {
                                    "_term": "asc"
                                }
                            },
                            "aggs": {
                                "destinationAgg": {
                                    "terms": {
                                        "field": "dest.keyword",
                                        "size": 550
                                        , "order": {
                                            "_term": "asc"
                                        }
                                    },
                                    "aggs": {
                                        "departureDelay": {
                                            "avg": {
                                                "field": "depDelay"
                                            }
                                        },
                                        "arrivalDelay": {
                                            "avg": {
                                                "field": "arrDelay"
                                            }
                                        },
                                        "carrierDelay": {
                                            "avg": {
                                                "field": "carrierDelay"
                                            }
                                        },
                                        "lateAircraftDelay": {
                                            "avg": {
                                                "field": "lateAircraftDelay"
                                            }
                                        },
                                        "securityDelay": {
                                            "avg": {
                                                "field": "securityDelay"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }).catch(err => console.log(err));
    let data = elasticResults.aggregations.airlinesAgg.buckets[0].originAgg.buckets;

    let results = {
        "iata": airlineCode,
        "year": year,
        "month": month
    }
    for (let i = 0; i < data.length; i++) {
        let destinations = data[i].destinationAgg.buckets;
        let destinationEntries = []
        for (let j = 0; j < destinations.length; j++) {
            let destination = {
                "destination": destinations[j].key,
                "avgDepDelay": (destinations[j].arrivalDelay.value).toFixed(2),
                "lateAircraftDelay": (destinations[j].lateAircraftDelay.value).toFixed(2),
                "securityDelay": (destinations[j].securityDelay.value).toFixed(2),
                "carrierDelay": (destinations[j].carrierDelay.value).toFixed(2)
            }
            destinationEntries.push(destination)
        }
        results[data[i].key] = destinationEntries
    }
    return results
}

async function retrieveAirlinePerformanceByYear(airlineCode, year) {
    let elasticResults = await client.search({
        index: 'ontimeperformance',
        type: 'ontimeperformance',
        body: {
            size: "12",
            query: {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "reporting_Airline.keyword": `${airlineCode}`
                            }
                        }, {
                            "match": {
                                "year": `${year}`
                            }
                        },
                        {
                            "range": {
                                "depDelay": {
                                    "gt": 0
                                }
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "airlinesAgg": {
                    "terms": {
                        "field": "reporting_Airline.keyword"
                    },
                    "aggs": {
                        "originAgg": {
                            "terms": {
                                "field": "origin.keyword",
                                "size": 550,
                                "order": {
                                    "_term": "asc"
                                }
                            },
                            "aggs": {
                                "destinationAgg": {
                                    "terms": {
                                        "field": "dest.keyword",
                                        "size": 550
                                        , "order": {
                                            "_term": "asc"
                                        }
                                    },
                                    "aggs": {
                                        "departureDelay": {
                                            "avg": {
                                                "field": "depDelay"
                                            }
                                        },
                                        "arrivalDelay": {
                                            "avg": {
                                                "field": "arrDelay"
                                            }
                                        },
                                        "carrierDelay": {
                                            "avg": {
                                                "field": "carrierDelay"
                                            }
                                        },
                                        "lateAircraftDelay": {
                                            "avg": {
                                                "field": "lateAircraftDelay"
                                            }
                                        },
                                        "securityDelay": {
                                            "avg": {
                                                "field": "securityDelay"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }).catch(err => console.log(err));

    let data = elasticResults.aggregations.airlinesAgg.buckets[0].originAgg.buckets;

    let results = {
        "iata": airlineCode,
        "year": year
    }
    for (let i = 0; i < data.length; i++) {
        let destinations = data[i].destinationAgg.buckets;
        let destinationEntries = []
        for (let j = 0; j < destinations.length; j++) {
            let destination = {
                "destination": destinations[j].key,
                "avgDepDelay": (destinations[j].arrivalDelay.value).toFixed(2),
                "lateAircraftDelay": (destinations[j].lateAircraftDelay.value).toFixed(2),
                "securityDelay": (destinations[j].securityDelay.value).toFixed(2),
                "carrierDelay": (destinations[j].carrierDelay.value).toFixed(2)
            }
            destinationEntries.push(destination)
        }
        results[data[i].key] = destinationEntries
    }
    return results
}

async function retrieveAirlinePerformance(airlineCode) {
    let elasticResults = await client.search({
        index: 'ontimeperformance',
        type: 'ontimeperformance',
        body: {
            size: "12",
            query: {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "reporting_Airline.keyword": `${airlineCode}`
                            }
                        },
                        {
                            "range": {
                                "depDelay": {
                                    "gt": 0
                                }
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "airlinesAgg": {
                    "terms": {
                        "field": "reporting_Airline.keyword"
                    },
                    "aggs": {
                        "originAgg": {
                            "terms": {
                                "field": "origin.keyword",
                                "size": 550,
                                "order": {
                                    "_term": "asc"
                                }
                            },
                            "aggs": {
                                "destinationAgg": {
                                    "terms": {
                                        "field": "dest.keyword",
                                        "size": 550
                                        , "order": {
                                            "_term": "asc"
                                        }
                                    },
                                    "aggs": {
                                        "departureDelay": {
                                            "avg": {
                                                "field": "depDelay"
                                            }
                                        },
                                        "arrivalDelay": {
                                            "avg": {
                                                "field": "arrDelay"
                                            }
                                        },
                                        "carrierDelay": {
                                            "avg": {
                                                "field": "carrierDelay"
                                            }
                                        },
                                        "lateAircraftDelay": {
                                            "avg": {
                                                "field": "lateAircraftDelay"
                                            }
                                        },
                                        "securityDelay": {
                                            "avg": {
                                                "field": "securityDelay"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }).catch(err => console.log(err));
    let data = elasticResults.aggregations.airlinesAgg.buckets[0].originAgg.buckets;

    let results = {
        "iata": airlineCode
    }
    for (let i = 0; i < data.length; i++) {
        let destinations = data[i].destinationAgg.buckets;
        let destinationEntries = []
        for (let j = 0; j < destinations.length; j++) {
            let destination = {
                "destination": destinations[j].key,
                "avgDepDelay": (destinations[j].arrivalDelay.value).toFixed(2),
                "lateAircraftDelay": (destinations[j].lateAircraftDelay.value).toFixed(2),
                "securityDelay": (destinations[j].securityDelay.value).toFixed(2),
                "carrierDelay": (destinations[j].carrierDelay.value).toFixed(2)
            }
            destinationEntries.push(destination)
        }
        results[data[i].key] = destinationEntries
    }
    return results
}

module.exports = router;