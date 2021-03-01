const express = require('express');
const WebSocket = require('ws');

const app = express();
const PORT = 8080;


app.use('/sample01', express.static('sample01'));
app.use('/sample02', express.static('sample02'));
app.use('/sample03', express.static('sample03/dist'));
app.use('/sample04', express.static('sample04'));
app.use('/sample05', express.static('sample05'));
app.use('/node_modules', express.static('node_modules'));
app.use('/.vrm', express.static('.vrm'));

const httpServer = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

const websocketServer = new WebSocket.Server({ noServer: true });

websocketServer.on('connection', ws => {

    ws.on('message', message => {

        websocketServer.clients.forEach(clientSocket => {

            if (clientSocket !== ws && clientSocket.readyState === WebSocket.OPEN) {

                clientSocket.send(message);

            }
        });
    });

    ws.on('close', () => {
        websocketServer.clients.forEach(clientSocket => {

            if (clientSocket !== ws) {

                clientSocket.close();

            }
        });
    });

});


httpServer.on('upgrade', (request, socket, head) => {
    const url = new URL(
        request.url,
        'http://example.com' // path以降を取り出したいだけなので、baseは適当でよい
    );
    const pathname = url.pathname;
    console.log(`Upgrade ${pathname}`);

    if (pathname === '/signaling') {

        websocketServer.handleUpgrade(request, socket, head, ws => {
            websocketServer.emit('connection', ws, request);
        });

    } else {
        socket.destroy();
    }

});
