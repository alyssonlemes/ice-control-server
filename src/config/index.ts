import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change_me_access';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change_me_refresh';
export const DATABASE_URL = process.env.DATABASE_URL || '';
