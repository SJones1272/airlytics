const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('../../airlytics-service-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

let router = express.Router();
const db = admin.firestore();

async function generateEntry(doc){
    let entry = doc.data();
    entry['iata'] = doc.id;
    let data = [];
    let bits = await db.collection('rankings').doc(doc.id).collection('data').get();
    bits.forEach(item => {
        data.push(item.data())
    });
    entry['data'] = data;
    return entry
}

router.get('/', async function (req, resp) {
    let airlines = await db.collection('rankings').get();
    let results = [];
    console.log("before wait")

    for(const doc of airlines.docs){
        let entry = await generateEntry(doc);
        results.push(entry);
    }
    console.log("after weight");
    resp.send(results);
});

router.get('/:iata', async function (req, resp) {
    let airlines = await db.collection('rankings').doc(req.params['iata']).get();
    let result = await generateEntry(airlines);
    resp.send(result);
});

module.exports = router;