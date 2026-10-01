import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const User = sequelize.define("User", {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    username: {
        type: DataTypes.STRING,
        allowNull: false
    },

    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },

    address: {
        type: DataTypes.STRING
    },

    contact_no: {
        type: DataTypes.STRING
    },

    role: {
        type: DataTypes.STRING,
        defaultValue: "customer"
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

export default User;