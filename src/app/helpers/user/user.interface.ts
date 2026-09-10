export interface UserFectchOutput {
    message: string,
    success: string,
    data?: UserModelOutput,
}

export interface UserModelOutput {
    first_name: string,
    last_name: string,
    contact_no?: string,
    address?: string,
}

export interface UserFetchDataOutput {
    first_name: string,
    last_name: string,
    contact_no: string,
    address: string,
    city: string,
    province: string,
}
