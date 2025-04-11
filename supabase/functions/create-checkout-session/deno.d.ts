declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  export function createClient(url: string, key: string): any;
}

declare module "https://esm.sh/stripe@14.21.0" {
  export default class Stripe {
    constructor(key: string, options?: { apiVersion: string });
    checkout: {
      sessions: {
        create(params: any): Promise<any>;
      };
    };
    customers: {
      create(params: any): Promise<any>;
    };
    prices: {
      list(params: any): Promise<any>;
      create(params: any): Promise<any>;
    };
    products: {
      create(params: any): Promise<any>;
    };
  }
} 