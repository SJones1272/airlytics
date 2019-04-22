const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// app.use('/api/financial', require('routes/financial'));
app.use('/api/airline', require('./routes/ranking'));
app.use('/api/performance', require('./routes/performance/index'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/airports', require('./routes/airports'));

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'))
});

var port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server is up on port ' + port);
});