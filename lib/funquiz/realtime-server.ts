import { createAdminClient } from "@/lib/supabase/admin";

/** Notify subscribed clients to refetch room state (no sensitive payload). */
export async function broadcastRoomSync(roomCode: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const channel = supabase.channel(`funquiz:${roomCode.toUpperCase()}`, {
      config: { broadcast: { ack: false, self: false } },
    });
    await new Promise<void>((resolve, reject) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") resolve();
        if (status === "CHANNEL_ERROR") reject(new Error("Realtime channel error"));
      });
    });
    await channel.send({
      type: "broadcast",
      event: "sync",
      payload: { t: Date.now() },
    });
    await supabase.removeChannel(channel);
  } catch {
    /* Realtime is best-effort; clients still poll */
  }
}
