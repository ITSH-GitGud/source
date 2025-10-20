"""
Simple test for laptop monitoring client
Tests connection to Next.js server and data collection
"""
import sys
import time

print("=" * 60)
print("🧪 Testing Laptop Monitor Client")
print("=" * 60)

# Test 1: Check if required modules are installed
print("\n1️⃣  Checking dependencies...")
try:
    import psutil
    import requests
    from laptop_data import LaptopMonitor
    print("✅ All dependencies installed")
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("\nInstall with: pip install -r requirements.txt")
    sys.exit(1)

# Test 2: Check if laptop data collection works
print("\n2️⃣  Testing data collection...")
try:
    monitor = LaptopMonitor()
    data = monitor.get_all_data()
    
    print("✅ Data collection working")
    print(f"   CPU: {data['cpu_info']['cpu_usage_percent']}%")
    print(f"   Memory: {data['memory_info']['percent']}%")
    print(f"   Battery: {data['battery_info']['percent'] if data['battery_info'] else 'N/A'}%")
except Exception as e:
    print(f"❌ Data collection failed: {e}")
    sys.exit(1)

# Test 3: Check Next.js server connection
print("\n3️⃣  Testing Next.js server connection...")
try:
    response = requests.get("http://localhost:3000", timeout=2)
    print("✅ Next.js server is running")
except requests.exceptions.ConnectionError:
    print("⚠️  Next.js server not running")
    print("\nStart it with: cd ../web && pnpm dev")
except Exception as e:
    print(f"⚠️  Connection test failed: {e}")

# Test 4: Test sending data to Next.js
print("\n4️⃣  Testing data send to Next.js...")
try:
    payload = {
        "deviceId": "test_device_123",
        "timestamp": data['timestamp'],
        "hostname": "test",
        "data": data
    }
    
    response = requests.post(
        "http://localhost:3000/api/devices/data",
        json=payload,
        timeout=5
    )
    
    if response.status_code in [200, 201]:
        print("✅ Data sent successfully to Next.js")
    elif response.status_code == 404:
        print("⚠️  API endpoint not found")
        print("   Create: /api/devices/data endpoint in Next.js")
    else:
        print(f"⚠️  Server responded with status {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("⚠️  Cannot connect to Next.js server")
    print("   Make sure Next.js is running on http://localhost:3000")
except Exception as e:
    print(f"⚠️  Test failed: {e}")

print("\n" + "=" * 60)
print("✅ Test completed!")
print("=" * 60)

print("\n📝 Next steps:")
print("   1. Make sure Next.js is running: cd ../web && pnpm dev")
print("   2. Start the client: python client.py")
print("   3. Check data in your Next.js app")
