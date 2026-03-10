const { Server } = require("socket.io");
let io;
const onlineUsers = new Map();

const initSocket = (server) => {
    io = new Server(server);

    io.on("connection", (socket) => {
        console.log("New socket connection attempt.");
        const userId = socket.handshake.query.userId;
        const deviceType = socket.handshake.query.deviceType; 
        const email = socket.handshake.query.email;
        // if (!email) {
        //     console.log("No email provided. Disconnecting.");
        //     socket.disconnect(true);
        //     return;
        // }

        console.log(`User Connected: ${email} on ${deviceType}`);
        console.log(`Socket ID: ${socket.id}`);

        // if (!onlineUsers.has(email.toString())) {
        //     onlineUsers.set(email.toString(), []);
        // }
        // onlineUsers.get(email.toString()).push({ socketId: socket.id, deviceType });
        
        console.log("Online Users:", onlineUsers);

        socket.on("disconnect", (reason) => {
            console.log(`User Disconnected: ${userId} from ${deviceType}`);
            console.log("Reason:", reason);
            
            const userConnections = onlineUsers.get(userId.toString());
            if (userConnections) {
                const index = userConnections.findIndex(conn => conn.socketId === socket.id);
                if (index !== -1) {
                    userConnections.splice(index, 1);
                }
                
                if (userConnections.length === 0) {
                    onlineUsers.delete(userId.toString());
                }
            }
            console.log("Online Users After Disconnect:", onlineUsers);
        });
    });
};

const sendNotificationToUser = (email,userId, eventName, data) => {
    const userConnections = onlineUsers.get(email,userId.toString());
    if (userConnections && io) {
        userConnections.forEach(connection => {
            io.to(connection.socketId).emit(eventName, data);
            console.log(`Notification sent to User ${email} on ${connection.deviceType}`);
        });
    } else {
        console.log(`User ${email} not online or no active connections`);
    }
};

module.exports = {
    initSocket,
    sendNotificationToUser
};
