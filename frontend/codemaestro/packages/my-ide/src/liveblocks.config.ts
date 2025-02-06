// liveblocks.config.ts
import { createClient } from "@liveblocks/client";
import { createLiveblocksContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: "pk_dev_UdoYqh5zcJmZJ6b38jSLvj5iMnpREKqd_3GMePROAkXMQiJtAE8CE0-XKMutv6nu",
});

export const { LiveblocksProvider } = createLiveblocksContext(client);
export { client };
