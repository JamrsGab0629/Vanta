// OUTPUT
export interface CartItem{
    product_id: string,
    sku: string,
    name: string,
    category: string,
    price: number,
    image_url: string,
    quantity: number,
}

export interface FetchCart{
    cart_id: string,
    items: CartItem[],
}