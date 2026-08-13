import bcrypt from "bcrypt";

const hashPassword = (password: string) => bcrypt.hash(password,10);
const comparePassword = (password: string,hash: string) => bcrypt.compare(password,hash);

export{
    hashPassword,
    comparePassword
}