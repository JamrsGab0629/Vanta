export default class user {
private username: string;
private passwordHashed: string;
private email: string;
private address: string;
private id: number;
constructor(username: string,password: string,email: string,address: string,id: number){
    this.username = username;
    this.passwordHashed = password;
    this.email = email;
    this.address = address;
    this.id = id;

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
 public get Id() {
        return this.id;
    }
}



