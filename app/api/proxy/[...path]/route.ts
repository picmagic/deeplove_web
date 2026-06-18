const DEFAULT_API_BASE_URL = "https://prod.deeploveai.net";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "yy-basic-params",
];

type ProxyParams = {
  path?: string[];
};

type ProxyRouteContext = {
  params: ProxyParams | Promise<ProxyParams>;
};

const getApiBaseUrl = () =>
  (process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL
  ).replace(/\/+$/, "");

const getPathParts = async (context: ProxyRouteContext) => {
  const params = await context?.params;
  return Array.isArray(params?.path) ? params.path : [];
};

const buildTargetUrl = async (request: Request, context: ProxyRouteContext) => {
  const requestUrl = new URL(request.url);
  const path = (await getPathParts(context))
    .map((part: string) => encodeURIComponent(part))
    .join("/");
  const targetUrl = new URL(`${getApiBaseUrl()}/${path}`);
  targetUrl.search = requestUrl.search;
  return targetUrl;
};

const buildForwardHeaders = (request: Request) => {
  const headers = new Headers();

  FORWARDED_REQUEST_HEADERS.forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });

  return headers;
};

const buildResponseHeaders = (upstreamHeaders: Headers) => {
  const headers = new Headers();

  upstreamHeaders.forEach((value, name) => {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
      headers.set(name, value);
    }
  });

  return headers;
};

async function proxy(request: Request, context: ProxyRouteContext) {
  const targetUrl = await buildTargetUrl(request, context);
  const method = request.method.toUpperCase();
  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers: buildForwardHeaders(request),
    cache: "no-store",
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const responseHeaders = buildResponseHeaders(upstream.headers);
    const contentType = upstream.headers.get("content-type") ?? "";

    if (contentType.includes("text/event-stream")) {
      responseHeaders.set("Content-Type", "text/event-stream");
      responseHeaders.set("Cache-Control", "no-cache, no-transform");
      responseHeaders.set("X-Accel-Buffering", "no");
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("API proxy request failed", error);

    return Response.json(
      { message: "API proxy request failed" },
      { status: 502 }
    );
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request, context: ProxyRouteContext) {
  return proxy(request, context);
}

export async function POST(request: Request, context: ProxyRouteContext) {
  return proxy(request, context);
}

export async function PUT(request: Request, context: ProxyRouteContext) {
  return proxy(request, context);
}

export async function PATCH(request: Request, context: ProxyRouteContext) {
  return proxy(request, context);
}

export async function DELETE(request: Request, context: ProxyRouteContext) {
  return proxy(request, context);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    },
  });
}
