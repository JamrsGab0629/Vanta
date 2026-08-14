import dotenv from "dotenv";
dotenv.config({ path: "./src/backend/.env" });

import { describe, it, expect } from "vitest"; // <-- Changed 'item' to 'it'
import sequelize from "./database";

describe("Database Connection", () => {
    it("should connect to PostgreSQL successfully", async () => {
        try {
            await sequelize.authenticate();
            expect(true).toBe(true);
        } catch (error) {
            console.error("FULL DB ERROR:", error);
            expect.fail(`Unable to connect to the database: ${error}`);
        }
    });
});