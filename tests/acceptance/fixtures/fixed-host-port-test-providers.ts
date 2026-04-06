import { createExplicitTestProviders } from "@multiverse/providers-testkit";
import { createFixedHostPortProvider } from "@multiverse/provider-fixed-host-port";

const base = createExplicitTestProviders();

export const providers = {
  resources: base.resources,
  endpoints: {
    "fixed-host-port": createFixedHostPortProvider()
  }
};
