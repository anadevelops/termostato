const httpProxy = require('express-http-proxy');
const express = require('express');
const app = express();
var logger = require('morgan');

app.use(logger('dev'));

//----------------------------------------------------------------
// Proxy
//----------------------------------------------------------------

// Create proxy
function selectProxyHost(req) {
    if (req.path.startsWith('/config'))
        return 'http://localhost:8080/';
    else if (req.path.startsWith('/logging'))
        return 'http://localhost:8070/';
    else return null;
}


// Use proxy
app.use((req, res, next) => {
    var proxyHost = selectProxyHost(req);
    if (proxyHost == null)
        res.status(404).send('Not found');
    else
        httpProxy(proxyHost)(req, res, next);
});


//----------------------------------------------------------------
// Server
//----------------------------------------------------------------

// Listen
app.listen(8000, () => {
    console.log('API Gateway iniciado!');
});


//----------------------------------------------------------------