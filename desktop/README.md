# 💻 Laptop Monitor Client

Simple Python client that sends laptop data to your Next.js web app.

## 📁 Files

-   **`client.py`** - Main client (sends data to Next.js)
-   **`laptop_data.py`** - Data collection module
-   **`test.py`** - Test script
-   **`requirements.txt`** - Dependencies
-   **`START.md`** - Full documentation & setup guide

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the client
python client.py
```

**See [START.md](START.md) for complete instructions!**

## 📊 What It Collects

-   CPU usage & cores
-   Memory (RAM) usage
-   Battery status & health
-   Power/charging info
-   Disk usage
-   Network stats
-   Temperature (if available)

Data is sent to your Next.js server every 10 seconds.

## ⚙️ Options

```bash
python client.py --server http://localhost:3000 --interval 10
```

-   `--server` - Next.js server URL (default: http://localhost:3000)
-   `--interval` - Update interval in seconds (default: 10)
-   `--device-id` - Custom device ID (auto-generated if omitted)

## 🧪 Test

```bash
python test.py
```

Tests dependencies, data collection, and Next.js connection.
