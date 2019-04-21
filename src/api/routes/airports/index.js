const express = require('express');
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    hosts: ['http://24.2.97.148:9200']
});

let router = express.Router();

router.get("/", async function(req, res){
    console.log("searching")
    let results = await client.search({
        index: 'airports',
        type: 'airports',
        body:{
            query:{
                "match_all": {}
            }
        }
    });
    console.log("finished")
    let airports = results.hits.hits.map(x => x['_source']);
    res.send(airports);
});


module.exports = router;