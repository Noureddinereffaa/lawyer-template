import { unstable_noStore as noStore } from "next/cache";
import { createAdminSupabaseClient } from "./supabase/server";
import { clientConfig as defaultConfig, ClientConfig } from "../../config/client.config";

/**
 * Fetches settings from Supabase and deep-merges with defaults.
 * `noStore()` is called to opt-out of Next.js's automatic fetch cache
 * so that every request always gets fresh data from Supabase — both
 * on localhost and on Vercel production.
 */
export async function getSettings(): Promise<ClientConfig> {
  // ⚠️ CRITICAL: Prevent Next.js from caching this fetch on Vercel
  noStore();

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("settings")
      .select("config_data")
      .single();

    if (error || !data?.config_data) {
      return defaultConfig;
    }

    const db = data.config_data as Partial<ClientConfig> & Record<string, any>;

    return {
      // ── Flat keys ────────────────────────────────────────────────
      lawyerName:  db.lawyerName  ?? defaultConfig.lawyerName,
      officeName:  db.officeName  ?? defaultConfig.officeName,
      tagline:     db.tagline     ?? defaultConfig.tagline,
      logo:        db.logo        ?? defaultConfig.logo,
      favicon:     db.favicon     ?? defaultConfig.favicon,
      ogImage:     db.ogImage     ?? defaultConfig.ogImage,

      // ── Nested objects (deep-merge) ───────────────────────────────
      theme:    { ...defaultConfig.theme,    ...(db.theme    || {}) },
      contact:  { ...defaultConfig.contact,  ...(db.contact  || {}) },
      seo:      { ...defaultConfig.seo,      ...(db.seo      || {}) },
      social:   { ...defaultConfig.social,   ...(db.social   || {}) },
      hero:     { ...defaultConfig.hero,     ...(db.hero     || {}) },
      about:    {
        description: db.about?.description ?? defaultConfig.about.description,
        features:    db.about?.features    ?? defaultConfig.about.features,
      },
      booking: {
        ...defaultConfig.booking,
        ...(db.booking || {}),
        workHours: {
          ...defaultConfig.booking.workHours,
          ...(db.booking?.workHours || {}),
        },
      },

      // ── Arrays ────────────────────────────────────────────────────
      trustBar:     (db.trustBar     && db.trustBar.length > 0)     ? db.trustBar     : defaultConfig.trustBar,
      testimonials: (db.testimonials && db.testimonials.length > 0) ? db.testimonials : defaultConfig.testimonials,
      stats:        (db.stats        && db.stats.length > 0)        ? db.stats        : defaultConfig.stats,
      specialties:  (db.specialties  && db.specialties.length > 0)  ? db.specialties  : defaultConfig.specialties,
      workingHours: (db.workingHours && db.workingHours.length > 0) ? db.workingHours : defaultConfig.workingHours,
    } as ClientConfig;

  } catch (err) {
    console.error("[getSettings] Error, falling back to defaults:", err);
    return defaultConfig;
  }
}
