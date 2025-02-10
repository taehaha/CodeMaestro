// liveblocks.config.ts
import { createClient } from "@liveblocks/client";
import { createLiveblocksContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: "pk_dev_wcRTPkCMtt5RRRNK1dldWR6vcR5_bvE2duMcpioZi5m_-nDl3mf6mZ4fpXI3NnCi",
});

export const { LiveblocksProvider } = createLiveblocksContext(client);
export { client };
