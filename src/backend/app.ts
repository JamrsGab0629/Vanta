import express from "express";

const createApp = () => {
    const app = express();

    app.use(express.json());

    return app;
}

export default createApp;