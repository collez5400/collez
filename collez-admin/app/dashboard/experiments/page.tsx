import { revalidatePath } from "next/cache";
import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";

type FeatureFlagsConfig = Record<
  string,
  {
    default: boolean;
    segments: Record<string, boolean>;
  }
>;

type ExperimentConfig = Record<
  string,
  {
    enabled: boolean;
    variants: Record<string, number>;
  }
>;

function parseJson<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== "object") return fallback;
  return value as T;
}

export default async function ExperimentsPage() {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();

  const { data } = await supabaseAdmin
    .from("app_config_entries")
    .select("key,value,description")
    .in("key", ["feature_flags", "ab_experiments"]);

  const map = new Map((data ?? []).map((row) => [String(row.key), row.value]));
  const featureFlags = parseJson<FeatureFlagsConfig>(map.get("feature_flags"), {});
  const experiments = parseJson<ExperimentConfig>(map.get("ab_experiments"), {});

  async function updateFeatureFlag(formData: FormData) {
    "use server";
    const flagKey = String(formData.get("flagKey") ?? "");
    const defaultEnabled = String(formData.get("defaultEnabled") ?? "false") === "true";
    const coordinator = String(formData.get("coordinator") ?? "false") === "true";
    const premium = String(formData.get("premium") ?? "false") === "true";
    const nonPremium = String(formData.get("nonPremium") ?? "false") === "true";
    const newUsers = String(formData.get("newUsers") ?? "false") === "true";
    if (!flagKey) return;

    const { data: current } = await supabaseAdmin
      .from("app_config_entries")
      .select("value")
      .eq("key", "feature_flags")
      .maybeSingle();
    const currentFlags = parseJson<FeatureFlagsConfig>(current?.value, {});
    currentFlags[flagKey] = {
      default: defaultEnabled,
      segments: {
        coordinator,
        premium,
        non_premium: nonPremium,
        new_users_7d: newUsers,
      },
    };

    await supabaseAdmin
      .from("app_config_entries")
      .update({
        value: currentFlags,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "feature_flags");

    revalidatePath("/dashboard/experiments");
  }

  async function updateExperiment(formData: FormData) {
    "use server";
    const testKey = String(formData.get("testKey") ?? "");
    if (!testKey) return;
    const enabled = String(formData.get("enabled") ?? "false") === "true";
    const weightA = Math.max(0, Number(formData.get("weightA") ?? 0));
    const weightB = Math.max(0, Number(formData.get("weightB") ?? 0));

    const { data: current } = await supabaseAdmin
      .from("app_config_entries")
      .select("value")
      .eq("key", "ab_experiments")
      .maybeSingle();
    const currentExperiments = parseJson<ExperimentConfig>(current?.value, {});
    currentExperiments[testKey] = {
      enabled,
      variants: {
        A: weightA,
        B: weightB,
      },
    };

    await supabaseAdmin
      .from("app_config_entries")
      .update({
        value: currentExperiments,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "ab_experiments");

    revalidatePath("/dashboard/experiments");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Feature Flags + A/B Tests</h1>
      <p className="mt-2 text-sm text-slate-400">
        Update remote config cohorts without shipping a new build.
      </p>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">Feature Flags</h2>
        <p className="mt-1 text-xs text-slate-400">
          Segment keys: coordinator, premium, non_premium, new_users_7d
        </p>
        <div className="mt-4 space-y-4">
          {Object.entries(featureFlags).map(([key, value]) => (
            <form key={key} action={updateFeatureFlag} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <input type="hidden" name="flagKey" value={key} />
              <p className="text-sm font-medium">{key}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <label className="text-xs text-slate-300">
                  Default
                  <select
                    name="defaultEnabled"
                    defaultValue={String(Boolean(value.default))}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  >
                    <option value="true">enabled</option>
                    <option value="false">disabled</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300">
                  coordinator
                  <select
                    name="coordinator"
                    defaultValue={String(Boolean(value.segments?.coordinator))}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  >
                    <option value="true">enabled</option>
                    <option value="false">disabled</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300">
                  premium
                  <select
                    name="premium"
                    defaultValue={String(Boolean(value.segments?.premium))}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  >
                    <option value="true">enabled</option>
                    <option value="false">disabled</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300">
                  non_premium
                  <select
                    name="nonPremium"
                    defaultValue={String(Boolean(value.segments?.non_premium))}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  >
                    <option value="true">enabled</option>
                    <option value="false">disabled</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300">
                  new_users_7d
                  <select
                    name="newUsers"
                    defaultValue={String(Boolean(value.segments?.new_users_7d))}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  >
                    <option value="true">enabled</option>
                    <option value="false">disabled</option>
                  </select>
                </label>
              </div>
              <button type="submit" className="mt-4 rounded border border-cyan-700 px-3 py-1.5 text-sm text-cyan-300">
                Save flag
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">A/B Tests</h2>
        <p className="mt-1 text-xs text-slate-400">Weight split is out of 100.</p>
        <div className="mt-4 space-y-4">
          {Object.entries(experiments).map(([key, value]) => (
            <form key={key} action={updateExperiment} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <input type="hidden" name="testKey" value={key} />
              <p className="text-sm font-medium">{key}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="text-xs text-slate-300">
                  Enabled
                  <select
                    name="enabled"
                    defaultValue={String(Boolean(value.enabled))}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  >
                    <option value="true">enabled</option>
                    <option value="false">disabled</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300">
                  Variant A weight
                  <input
                    name="weightA"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={Number(value.variants?.A ?? 50)}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-300">
                  Variant B weight
                  <input
                    name="weightB"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={Number(value.variants?.B ?? 50)}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  />
                </label>
              </div>
              <button type="submit" className="mt-4 rounded border border-fuchsia-700 px-3 py-1.5 text-sm text-fuchsia-300">
                Save experiment
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
