
const ENV = {
    restURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000",
    wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws/telemetry'
};

if (!ENV.restURL && !ENV.wsURL) {
    console.error("Not Found: MISSING ENVIRONMENT SETTING");
};

export default ENV;