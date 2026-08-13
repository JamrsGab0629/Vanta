export default class user {
private username: string;
private passwordHashed: string;
private email: string;
private address: string;

constructor(username: string,password: string,email: string,address: string){
    this.username = username;
    this.passwordHashed = password;
    this.email = email;
    this.address = address;

}

public get userName(){
    return this.username;
}
public get Password(){
    return this.passwordHashed;
}
public get Email(){
    return this.email;
}
public get Address(){
    return this.address;
}

}



