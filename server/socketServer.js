const { Server } = require('socket.io');
const { createServer } = require('http');
const { readConfigs } = require('../services/configsFunction');
const {version} = require('./../package.json');

let io;

const initSocketServer = () => {
    const httpServer = createServer();
    io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5174', // ou '*' para permitir de qualquer origem
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', async (socket) => {
        console.log('Cliente conectado:', socket.id)
        const configuracoes = await readConfigs()

        socket.emit('teste', configuracoes);
        socket.emit('update', configuracoes.LAST_UPDATE);
        socket.emit('version', version);

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });

    httpServer.listen(9222, () => {
        console.log('Servidor Socket.IO ouvindo na porta 9222');
    });
};

const getIoInstance = () => {
    if (!io) {
        throw new Error('O servidor de socket ainda não foi inicializado.');
    }
    return io;
};

module.exports = { initSocketServer, getIoInstance };
