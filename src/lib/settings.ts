import { createServerSupabaseClient } from "./supabase/server";
import { clientConfig as defaultConfig, ClientConfig } from "../../config/client.config";

export async function getSettings(): Promise<ClientConfig> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("settings")
      .select("config_data")
      .single();

    if (error || !data || !data.config_data) {
      // Return default if table doesn't exist yet or row is missing
      return defaultConfig;
    }

    // Merge DB config with default to ensure no missing keys
    return {
      ...defaultConfig,
      ...data.config_data,
      theme: { ...defaultConfig.theme, ...(data.config_data.theme || {}) },
      contact: { ...defaultConfig.contact, ...(data.config_data.contact || {}) },
      seo: { ...defaultConfig.seo, ...(data.config_data.seo || {}) },
      booking: { ...defaultConfig.booking, ...(data.config_data.booking || {}) },
      social: { ...defaultConfig.social, ...(data.config_data.social || {}) },
    };
  } catch (error) {
    console.error("Error fetching settings, falling back to defaults", error);
    return defaultConfig;
  }
}
