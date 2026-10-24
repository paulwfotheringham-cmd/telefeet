/** PostgREST / Postgres errors indicating Fun Quiz tables are not migrated yet. */
export function isFunquizMigrationRequired(error: {
  message?: string;
  code?: string;
}): boolean {
  const msg = error.message ?? "";
  if (!msg.includes("funquiz_rooms") && !msg.includes("funquiz_players")) {
    return false;
  }
  return (
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    error.code === "42P01" ||
    error.code === "PGRST205"
  );
}
