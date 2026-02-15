export interface Product {
    Id: number;
    Name: string;
    Description: string;
    Price: number;
    Stock: number;
    Category_id: number;
    Created_at: string;
    Updated_at: string;
}

export interface Category {
    Id: number;
    Name: string;
    Created_at: string;
}

export interface OrderItemInput {
    product_id: number;
    quantity: number;
}

export interface OrderInput {
    user_id: number;
    items: OrderItemInput[];
}
