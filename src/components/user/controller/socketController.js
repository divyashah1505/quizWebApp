// socketController.js
const { Server } = require('socket.io');
let io;
const onlineUsers = new Map();

const initSocket = (server) => {
    io = new Server(server);
    io.on('connection', (socket) => {
        console.log('New socket connection attempt.');
        const userId = socket.handshake.query.userId;
        const deviceType = socket.handshake.query.deviceType;
        const email = socket.handshake.query.email; 

        const identifier = email || userId;

        if (!identifier) {
            console.log('No email or userId provided. Disconnecting.');
            socket.disconnect(true);
            return;
        }

        console.log(`User Connected: ${identifier} on ${deviceType}`);
        console.log(`Socket ID: ${socket.id}`);

        if (!onlineUsers.has(identifier.toString())) {
            onlineUsers.set(identifier.toString(), []);
        }
        onlineUsers.get(identifier.toString()).push({ socketId: socket.id, deviceType });

        socket.on('disconnect', (reason) => {
            console.log(`User Disconnected: ${identifier} from ${deviceType}`);
            console.log('Reason: ', reason);
            const userConnections = onlineUsers.get(identifier.toString());
            if (userConnections) {
                const index = userConnections.findIndex(conn => conn.socketId === socket.id);
                if (index !== -1) {
                    userConnections.splice(index, 1);
                }
                if (userConnections.length === 0) {
                    onlineUsers.delete(identifier.toString());
                }
            }
        });
    });
};

const sendNotificationToUser = (identifier, eventName, data) => {
    const userConnections = onlineUsers.get(identifier.toString());
    if (userConnections && io) {
        userConnections.forEach(connection => {
            io.to(connection.socketId).emit(eventName, data);
            console.log(`Notification sent to User ${identifier} on ${connection.deviceType}`);
        });
    } else {
        console.log(`User ${identifier} not online or no active connections`);
    }
};

module.exports = { initSocket, sendNotificationToUser };
