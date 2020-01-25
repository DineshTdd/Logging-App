const { app } = require('./lib/app');
const http = require('http');
const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);


httpServer.listen(PORT, () => {
    console.log(`Server up and running on port : ${PORT}`);
});