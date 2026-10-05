import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      restaurantId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    restaurantId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    restaurantId?: string;
  }
}