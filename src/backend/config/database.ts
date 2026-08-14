import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sequelize = new Sequelize(
    process.env["DB_NAME"]!,
    process.env["DB_USER"]!,
    process.env["DB_PASSWORD"]!,
    {
        host: process.env["DB_HOST"]!,
        port: Number(process.env["DB_PORT"]),
        dialect: "postgres",
        logging: false
    }
);

export default sequelize;