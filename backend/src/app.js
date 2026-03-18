import express from "express";
import {createServer} from "node:http";
import { Server } from "socket.io";
import {connectToSocket} from "./controllers/socketManager.js";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ "limit": "40kb" }));
app.use(express.urlencoded({ "limit": "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/home", (req, res) => {
    return res.json({ "hello": "world" });
});

const start = async () => {
    try {
        const connectionDb = await mongoose.connect(process.env.MONGODB, {
            tls: true,
            tlsAllowInvalidCertificates: false,
        });
        console.log(`MONGO CONNECTED DB HOST: ${connectionDb.connection.host}`);

        server.listen(app.get("port"), () => {
            console.log(`LISTENING ON PORT ${app.get("port")}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
};

start();