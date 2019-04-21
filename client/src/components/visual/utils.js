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
        let data = this.data;
        let filter = this.filter;
        let accessor = this.accessor;

        _.each(this.mmap, function (a) {
            if (!matrix[a.id]) matrix[a.id] = [];
            _.each(mmap, function (b) {
                var recs = _.filter(data, function (row) {
                    return filter(row, a, b);
                })
                matrix[a.id][b.id] = accessor(recs, a, b);
            });
        });
        return matrix;
    }

    addValuesToMap = (varName, info) => {
        console.log(this.data);
        console.log(varName);
        let values = this.findUniqueValues(this.data.data, varName);
        console.log(values);
        values.forEach((value, index) => {
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
            if(!result.includes(row[varName])){
                console.log(row[varName]);
                result.push(row[varName])
            }
        });

        return result;

    }
}

export default ChordMpr;