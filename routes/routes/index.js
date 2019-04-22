const express = require('express');
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    hosts: ['http://24.2.97.148:9200']
});

let router = express.Router();

router.get("/airline/:iata", async function (req, res) {
    let results = await retrieveRoutesForAirline(req.params['iata']);
    res.send(results)
});

router.get("/airline/:iata/traffic", async function (req, res) {
    let results = await retrieveRouteTrafficForAirline(req.params['iata']);
    res.send(results)
});

router.get("/:from-:to", async function (req, res) {
    let results = await retrieveAirlinesForRoute(req.params['from'], req.params['to']);
    res.send(results);
});

router.get("/", async function (req, res) {
    let results = await retrieveRoutes();
    res.send(results)
});

async function retrieveRoutes() {
    let elasticResults = await client.search({
        index: 'routes',
        type: 'routes',
        body: {
            query: {
                "match_all": {}
            },
            "aggs": {
                "originAgg": {
                    "terms": {
                        "field": "sourceAirport.keyword",
                        "size": 300,
                        "order": {
                            "_term": "asc"
                        }
                    },
                    "aggs": {
                        "destinationAgg": {
                            "terms": {
                                "field": "destinationAirport.keyword",
                                "size": 300,
                                "order": {
                                    "_term": "asc"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    let data = elasticResults.aggregations.originAgg.buckets;
    let results = {};
    for (let i = 0; i < data.length; i++) {
        let destinations = data[i].destinationAgg.buckets;
        let destinationEntries = [];
        for (let j = 0; j < destinations.length; j++) {
            destinationEntries.push(destinations[j]['key']);
        }
        results[data[i].key] = destinationEntries;
    }
    return results

}

async function retrieveRouteTrafficForAirline(airlineCode) {
    let elasticResults = await client.search({
        index: 'routes',
        type: 'routes',
        body: {
            query: {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "airline.keyword": `${airlineCode}`
                            }
                        }
                    ]
                }
            },
            // "aggs": {
                // "originAgg": {
                //     "terms": {
                //         "field": "sourceAirport.keyword",
                //         "size": 5000,
                //         "order": {
                //             "_term": "asc"
                //         }
                //     }
                // },
                "aggs": {
                    "destinationAgg": {
                        "terms": {
                            "field": "destinationAirport.keyword",
                            "size": 5000,
                            "order": {
                                "_term": "asc"
                            }
                        }
                    }
                }
            }
        // }
    });

    let departureData = elasticResults.aggregations.destinationAgg.buckets;

    let results = {
        "iata": airlineCode,
        data: departureData.map(a => { return {'airport': a.key, 'intensity': a['doc_count']}})
    };

    // for (let i = 0; i < data.length; i++) {
    //     let destinations = data[i].destinationAgg.buckets;
    //     let destinationEntries = [];
    //     for (let j = 0; j < destinations.length; j++) {
    //         destinationEntries.push(destinations[j]['key']);
    //     }
    //     results[data[i].key] = destinationEntries;
    // }
    return results
}

async function retrieveRoutesForAirline(airlineCode) {
    let elasticResults = await client.search({
        index: 'routes',
        type: 'routes',
        body: {
            "size": 8000,
            query: {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "airline.keyword": `${airlineCode}`
                            }
                        }
                    ]
                }
            }
        }
    });

    let data = elasticResults.hits.hits;
    let results = {
        "iata": airlineCode,
        data: data.map((x) => x['_source'])
    };

    return results
}

async function retrieveAirlinesForRoute(origin, destination){
    let elasticResults = await client.search({
        index: 'routes',
        type: 'routes',
        body: {
            "size": 10000,
            query: {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "sourceAirport.keyword": origin
                            }
                        },
                        {
                            "match": {
                                "destinationAirport.keyword": destination
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "airline": {
                    "terms": {
                        "field": "airline.keyword",
                        "size": 10000
                    }
                }

            }
        }
    });

    return elasticResults.aggregations.airline.buckets.map(x => x.key);
}

module.exports = router;