import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** Account phone (normalized digits), required for all users */
      phone: string;
    } & DefaultSession["user"];
  }

  interface User {
    phone: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone: string;
  }
}
