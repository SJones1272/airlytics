const express = require('express');
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    hosts: ['http://24.2.97.148:9200']
});

let router = express.Router();

router.get("/", async function (req, res) {
    console.log("searching")
    let results = await client.search({
        index: 'airports',
        type: 'airports',
        body: {
            size: 8000,
            query: {
                "match": {
                    "match_all": {}
                }
            }
        }
    });
    console.log(results.hits.hits);
    let airports = {};
    results.hits.hits.forEach(x => airports[x['_source']['iATA']] = x['_source']);
    res.send(airports);
});


module.exports = router;