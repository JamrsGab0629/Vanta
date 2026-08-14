import "dotenv/config";
import createApp from "./app";
import sequelize from "./config/database"; 
import "./model/userModel"; 

const app = createApp();
const PORT = process.env['PORT'] || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Database connection established successfully!");

        await sequelize.sync({ alter: true });
        console.log("Database synchronized and tables created!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

startServer();