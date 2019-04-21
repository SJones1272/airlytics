//Reactified this util blog-post - http://www.delimited.io/blog/2013/12/8/chord-diagrams-in-d3

import _ from 'underscore';

class ChordMpr {

    constructor(data) {
        this.data = data
        this.mpr = {}
        this.mmap = {}
        this.n = 0
        this.matrix = []
        this.filter = {}
        this.accesor = {}
    }

    setFilter = function (fun) {
        this.filter = fun;
        return this;
    }

    setAccessor = function (fun) {
        this.accessor = fun;
        return this;
    }

    getMatrix = function () {
        let matrix = [];
        let mmap = this.mmap;
        let data = this.data.data;
        let filter = this.filter;
        let accessor = this.accessor;

        console.log(data)

        Object.keys(this.mmap).forEach(a => {
            if(!matrix[mmap[a].id]){
                matrix[mmap[a].id] = [];
                Object.keys(this.mmap).forEach(b => {
                    let recs =  data.filter(entry => entry['sourceAirport'] === a && entry['destinationAirport'] === b);
                    matrix[mmap[a].id][mmap[b].id] = !recs[0] ? mmap[b].id : mmap[a].id;
                })
            }
        });

        return matrix;
    }

    addValuesToMap = (varName, info) => {
        let values = this.findUniqueValues(this.data.data, varName);
        values.forEach((value) => {
            this.mmap[value] = {name: value, id: this.n++, data: info}
        });
        return this;
    }

    getMmap = () => {
        return this.mmap;
    }

    findUniqueValues = (data, varName) => {
        let result = [];

        data.forEach(row => {
            if(!result.includes(row[varName]) && !this.mmap[row[varName]]){
                result.push(row[varName])
            }
        });

        return result;

    }
}

export default ChordMpr;