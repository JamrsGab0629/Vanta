import "dotenv/config";
import createApp from "./app";
import sequelize from "./config/database"; 
import "./model/userModel"; 
import "./model/tokenBlacklistModel"; 
import "./model/productModel"; 

const app = createApp();
const PORT = process.env['PORT'] || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Database connection established successfully!");

         await sequelize.sync({ alter: true });
         // await sequelize.sync({ force: true });
        console.log("Database synchronized and tables created!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
}
console.log("Connected to database:", sequelize.getDatabaseName());
startServer();