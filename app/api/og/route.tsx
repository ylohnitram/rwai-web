import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") || "RWA Directory"

  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "#0F172A",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
      }}
    >
      <div
        style={{
          fontSize: 24,
          marginBottom: 24,
          color: "#94a3b8",
        }}
      >
        RWA Directory
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: "bold",
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 24,
          marginTop: 24,
          color: "#3b82f6",
        }}
      >
        Tokenized Real-World Assets
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}

