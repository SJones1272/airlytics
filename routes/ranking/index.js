const express = require('express');
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    hosts: ['http://24.2.97.148:9200']
});
//COMMENTED OUT ONLY RUNS WITH API KEY

// const admin = require('firebase-admin');
// const serviceAccount = require('../../airlytics-service-key.json');
//
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
//
let router = express.Router();
// const db = admin.firestore();
//
// async function generateEntry(doc){
//     let entry = doc.data();
//     entry['iata'] = doc.id;
//     let data = [];
//     let bits = await db.collection('rankings').doc(doc.id).collection('data').get();
//     bits.forEach(item => {
//         data.push(item.data())
//     });
//
//     let orderedData = [];
//     orderedData[0] = data[0];
//     orderedData[1] = data[1];
//     data.splice(6,14).forEach(x => orderedData.push(x));
//     data.splice(2,5).forEach(x => orderedData.push(x));
//     entry['data'] = orderedData;
//     return entry
// }
//
// router.get('/', async function (req, resp) {
//     let airlines = await db.collection('rankings').get();
//     let results = [];
//     console.log("before wait")
//
//     for(const doc of airlines.docs){
//         let entry = await generateEntry(doc);
//         results.push(entry);
//     }
//     console.log("after weight");
//     resp.send(results);
// });
//
// router.get('/:iata', async function (req, resp) {
//     let airlines = await db.collection('rankings').doc(req.params['iata']).get();
//     let result = await generateEntry(airlines);
//     resp.send(result);
// });
//
// const airlines = require('../airline-data');

async function retrieveAirlinesForRoute(origin, destination){
    let elasticResults = await client.search({
        index: 'routes',
        type: 'routes',
        body: {
            "size": 0,
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

let airlineData = require('../airline-data');

router.post("/routes/:from-:to", async function(req, res){
    let factors = req.body;
    console.log(factors);
    let airlines = await retrieveAirlinesForRoute(req.params['from'], req.params['to']).catch(err => console.log(err));
    let results = []; //{iata, name, score}

    airlineData.airlines.forEach(airline => {
        if(airlines.includes(airline.iata)){
            let score = 0;
            airline.data.forEach(value => {
                let key = Object.keys(value)[0];
                let v = value[key];
                if(factors[key] !== undefined){
                    score += v * factors[key]
                }
            })

            let entry = {
                "iata": airline.iata,
                "name": airline.name,
                "score": score
            }

            results.push(entry)
        }
    })
    res.send(results)
})

module.exports = router;