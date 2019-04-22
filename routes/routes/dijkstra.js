

function calculateBestPath(data, originStr, destStr, preferredAirline) {
    var preferredAirline = [preferredAirline];
    var AllData = data.aggregations.destinationAgg.buckets;

    bestRoute = {}
    tmpRoute = {}
    for (var i = 0; i < AllData.length; ++i) {
        var aggOrig = AllData[i];
        var aggsT = aggOrig.destinationAgg.buckets;
        //var tObj = []
        //var tObj = {};
        var tObj = {};
        var foundAirlines = false;
        for (var j = 0; j < aggsT.length; ++j) {
            //console.log(aggsT[j].key);

            var destItem = aggsT[j].key;
            var tObj2Buckets = aggsT[j].airlineAgg.buckets;

            foundAirlines = tObj2Buckets.filter(function (fAirline) {
                var foundT = false;
                var foundAirlineM = preferredAirline.some(function (pAirline) {
                    var foundP = pAirline == fAirline.key;
                    if (foundP) {
                        foundT = true;
                    }
                    return foundT;
                });
                return foundAirlineM;
            });

            tObj[destItem] = 1;
        }
        if (foundAirlines != undefined && foundAirlines.length > 0) {
            tmpRoute[aggOrig.key] = tObj;
        }
    }


    tmpRoute[destStr] = {};

    var myJSON = JSON.stringify(tmpRoute, null, '\t')

    var tmpRouteFieldLength = Object.keys(tmpRoute).length;
    if (tmpRouteFieldLength > 1) {
        bestRoute = dijkstraAlg(tmpRoute, originStr, destStr);
        if (bestRoute["path"].length <= 1) {
            console.log("No route exists for that airline");
        }
    }
    else {
        console.log("No route exists for that airline");
    }
    return bestRoute;
}


function log(message) {
    const logging = false;
    if (logging) {
        console.log(message);
    }
}


const lowestCostNode = (costs, processed) => {
    return Object.keys(costs).reduce((lowest, node) => {
        if (lowest === null || costs[node] < costs[lowest]) {
            if (!processed.includes(node)) {
                lowest = node;
            }
        }
        return lowest;
    }, null);
};

// function that returns the minimum cost and path to reach Finish
const dijkstraAlg = (graph, startNodeName, endNodeName) => {

    // track the lowest cost to reach each node
    let costs = {};
    costs[endNodeName] = "Infinity";
    costs = Object.assign(costs, graph[startNodeName]);

    // track paths
    const parents = { endNodeName: null };
    for (let child in graph[startNodeName]) {
        parents[child] = startNodeName;
    }

    // track nodes that have already been processed
    const processed = [];

    let node = lowestCostNode(costs, processed);

    while (node) {
        let cost = costs[node];
        let children = graph[node];
        for (let n in children) {
            if (String(n) === String(startNodeName)) {
                log("Don't go back to start");
            } else {
                log("StartNodeName: " + startNodeName);
                log("Evaluating cost to node " + n + " (looking from node " + node + ")");
                log("Last Cost: " + costs[n]);
                let newCost = cost + children[n];
                log("New Cost: " + newCost);
                if (!costs[n] || costs[n] > newCost) {
                    costs[n] = newCost;
                    parents[n] = node;
                    log("Updated cost und parents");
                } else {
                    log("A shorter path already exists");
                }
            }
        }
        processed.push(node);
        node = lowestCostNode(costs, processed);
    }

    let optimalPath = [endNodeName];
    let parent = parents[endNodeName];
    while (parent) {
        optimalPath.push(parent);
        parent = parents[parent];
    }
    optimalPath.reverse();

    const results = {
        distance: costs[endNodeName],
        path: optimalPath
    };

    return results;
};

module.exports = { calculateBestPath }