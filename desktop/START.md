# 🚀 Laptop Monitor - Quick Start

## What This Does

Sends your laptop data (CPU, RAM, battery, power, etc.) to your Next.js web app every 10 seconds.

---

## 📦 Installation

```bash
cd desktop
pip install -r requirements.txt
```

---

## ▶️ Start Commands

### 1. Start Next.js Server (Terminal 1)

```bash
cd web
pnpm dev
```

✅ Server will run on `http://localhost:3000`

### 2. Start Python Client (Terminal 2)

```bash
cd desktop
python client.py
```

**That's it!** Your laptop will now send data to the Next.js server every 10 seconds.

---

## ⚙️ Options

```bash
# Custom server URL
python client.py --server http://192.168.1.100:3000

# Custom update interval (seconds)
python client.py --interval 30

# Custom device ID
python client.py --device-id my-laptop-01
```

---

## 🧪 Test Everything Works

```bash
python test.py
```

This will:

-   ✅ Check dependencies are installed
-   ✅ Test data collection
-   ✅ Test Next.js server connection
-   ✅ Try sending test data

---

## 📡 Next.js API Endpoints Needed

### Receive Data (required)

```typescript
// app/api/devices/data/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { deviceId, timestamp, hostname, data } = body;

    // TODO: Save to your database
    console.log("Received data from:", deviceId);
    console.log("CPU:", data.cpu_info.cpu_usage_percent + "%");

    return NextResponse.json({ success: true });
}
```

### Send Commands (optional)

```typescript
// app/api/devices/[deviceId]/commands/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { deviceId: string } }) {
    // TODO: Get commands from database
    const commands = [
        // { id: "1", type: "shutdown" },
        // { id: "2", type: "update_interval", value: 30 }
    ];

    return NextResponse.json({ commands });
}
```

---

## 📊 Data Format

```json
{
    "deviceId": "MyLaptop_c8:8a:9a:e3:2f:a5",
    "timestamp": "2025-10-20T10:30:00.000Z",
    "hostname": "MyLaptop",
    "data": {
        "cpu_info": {
            "cpu_usage_percent": 25.5,
            "physical_cores": 10,
            "total_cores": 12,
            "cpu_freq_current": 2400
        },
        "memory_info": {
            "total_gb": 16,
            "used_gb": 8.5,
            "percent": 53.1
        },
        "battery_info": {
            "percent": 85,
            "plugged_in": false
        },
        "power_info": {
            "voltage_v": 11.4,
            "current_rate_w": 15.2,
            "battery_health": 98.8
        }
    }
}
```

---

## 🎯 Commands You Can Send

```json
// Stop monitoring
{ "id": "cmd1", "type": "stop" }

// Shutdown laptop (10 second delay)
{ "id": "cmd2", "type": "shutdown" }

// Restart laptop (10 second delay)
{ "id": "cmd3", "type": "restart" }

// Change update interval
{ "id": "cmd4", "type": "update_interval", "value": 30 }
```

---

## 📁 Files You Need

-   ✅ `laptop_data.py` - Collects system data
-   ✅ `client.py` - Sends to Next.js & receives commands
-   ✅ `requirements.txt` - Python dependencies
-   ✅ `test.py` - Test everything works

**Files you can ignore/delete:**

-   ❌ `server.py` (you have Next.js)
-   ❌ `data_exchange.py` (replaced by client.py)
-   ❌ `send_command.py` (use Next.js UI)
-   ❌ `test_system.py` (old test)
-   ❌ `USAGE.md` (old docs)
-   ❌ `README.md` (old docs)

---

## 🔧 Troubleshooting

**"ModuleNotFoundError"**

```bash
pip install -r requirements.txt
```

**"Connection refused"**

-   Make sure Next.js is running: `cd web && pnpm dev`
-   Check it's on port 3000

**"Can't find laptop_data"**

```bash
# Make sure you're in the desktop folder
cd desktop
python client.py
```

---

## 🎉 Done!

Your laptop is now sending data to your Next.js app every 10 seconds!

Check your Next.js terminal to see the incoming data logs.
