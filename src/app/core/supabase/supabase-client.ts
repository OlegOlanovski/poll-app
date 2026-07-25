import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';
import { Database } from './database.types';

@Injectable({
  providedIn: 'root',
})
export class SupabaseClientService {
  readonly isConfigured = Boolean(environment.supabase.url && environment.supabase.publishableKey);

  private readonly client = this.createConfiguredClient();

  /**
   * Returns the configured browser client.
   *
   * @returns The configured Supabase client.
   * @throws An error when the required environment values are missing.
   */
  get database(): SupabaseClient<Database> {
    if (!this.client) {
      throw new Error('Supabase environment values are missing.');
    }

    return this.client;
  }

  /**
   * Creates a client only when both public values exist.
   *
   * @returns The configured client, or null when configuration is missing.
   */
  private createConfiguredClient(): SupabaseClient<Database> | null {
    if (!this.isConfigured) {
      return null;
    }

    return createClient<Database>(environment.supabase.url, environment.supabase.publishableKey);
  }
}
