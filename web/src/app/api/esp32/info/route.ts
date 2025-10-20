export const GET = async (req: Request) => {
    return new Response("ESP32 Info Endpoint");
};

export const POST = async (req: Request) => {
    console.log("Received ESP32 info POST request");
    console.log("Request headers:", req.json());
    return new Response("ESP32 Info Endpoint");
};