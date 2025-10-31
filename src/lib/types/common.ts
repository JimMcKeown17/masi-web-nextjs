// lib/types/common.ts
export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  }
  
  export interface School {
    id: number;
    name: string;
    type: string;
    city: string;
    address: string;
    contact_phone: string;
    contact_email: string;
  }