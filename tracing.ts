import { CollectorTraceExporter } from "@opentelemetry/exporter-collector"
import { registerInstrumentations } from "@opentelemetry/instrumentation"
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http"
import { NodeTracerProvider } from "@opentelemetry/node"
import { BatchSpanProcessor } from "@opentelemetry/tracing"

const provider: NodeTracerProvider = new NodeTracerProvider()

const exportUrl = process.env.OTEL_EXPORT_URL
const exporter = new CollectorTraceExporter({
  url: exportUrl,
})

provider.addSpanProcessor(new BatchSpanProcessor(exporter))

if (exportUrl != null) {
  provider.register()
}

registerInstrumentations({
  instrumentations: [new HttpInstrumentation({ serverName: "arm-server" })],
})
