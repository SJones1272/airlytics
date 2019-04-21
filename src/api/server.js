const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


var port = process.env.PORT || 8080;


// app.use('/api/financial', require('routes/financial'));
app.use('/api/airline', require('./routes/ranking'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/airports', require('./routes/airports'));

app.listen(port);
console.log('Server is up on port ' + port);

