import { lightstep } from "lightstep-opentelemetry-launcher-node"

if (process.env.OTEL_EXPORTER_OTLP_SPAN_ENDPOINT != null) {
  const sdk = lightstep.configureOpenTelemetry({
    serviceName: "arm-server",
  })

  void sdk.start()
}
