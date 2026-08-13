import sequelize from "./database";

const testDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected!");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

testDatabase();