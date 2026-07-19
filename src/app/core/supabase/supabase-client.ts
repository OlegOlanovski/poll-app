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

  /** Returns the configured browser client. */
  get database(): SupabaseClient<Database> {
    if (!this.client) {
      throw new Error('Supabase environment values are missing.');
    }

    return this.client;
  }

  /** Creates a client only when both public values exist. */
  private createConfiguredClient(): SupabaseClient<Database> | null {
    if (!this.isConfigured) {
      return null;
    }

    return createClient<Database>(environment.supabase.url, environment.supabase.publishableKey);
  }
}
