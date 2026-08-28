
import User from "../model/userModel";

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ where: { email } });
};