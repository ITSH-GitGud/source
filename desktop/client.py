"""
Simple RESTful Client for Next.js Server Integration
Sends laptop data and receives commands from your Next.js backend
"""
import requests
import time
import os
import platform
import uuid
from datetime import datetime
from laptop_data import LaptopMonitor


class SimpleClient:
    """Minimal client to communicate with Next.js server"""
    
    def __init__(self, server_url, device_id=None, update_interval=10):
        """
        Initialize client
        
        Args:
            server_url: Your Next.js server URL (e.g., 'http://localhost:3000')
            device_id: Unique device ID (auto-generated if None)
            update_interval: Seconds between data updates (default: 10)
        """
        self.server_url = server_url.rstrip('/')
        self.device_id = device_id or self._generate_device_id()
        self.update_interval = update_interval
        self.monitor = LaptopMonitor(update_interval=1)
        self.running = False
        self.session = requests.Session()  # Reuse connection
        
    def _generate_device_id(self):
        """Generate unique device ID"""
        hostname = platform.node()
        mac = ':'.join(['{:02x}'.format((uuid.getnode() >> i) & 0xff) 
                        for i in range(0, 8*6, 8)][::-1])
        return f"{hostname}_{mac}"
    
    def send_data(self):
        """Send laptop data to Next.js server"""
        try:
            # Get laptop data
            data = self.monitor.get_all_data()
            
            # Prepare payload for Next.js API
            payload = {
                "deviceId": self.device_id,
                "timestamp": datetime.now().isoformat(),
                "hostname": platform.node(),
                "data": data
            }
            
            # Send to Next.js API endpoint
            response = self.session.post(
                f"{self.server_url}/api/devices/data",
                json=payload,
                timeout=10,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✅ Data sent at {datetime.now().strftime('%H:%M:%S')} - {result.get('message', 'OK')}")
                return result
            else:
                print(f"⚠️  Server responded: {response.status_code} - {response.text[:100]}")
                return None
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to {self.server_url}")
            return None
        except requests.exceptions.Timeout:
            print(f"❌ Request timeout")
            return None
        except Exception as e:
            print(f"❌ Error sending data: {e}")
            return None
    
    def check_commands(self):
        """Check for commands from Next.js server"""
        try:
            response = self.session.get(
                f"{self.server_url}/api/devices/{self.device_id}/commands",
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                commands = result.get('commands', [])
                
                if commands:
                    print(f"\n📬 Received {len(commands)} command(s)")
                
                # Execute each command
                for command in commands:
                    self.execute_command(command)
                
                return commands
            elif response.status_code == 404:
                # Endpoint not found or no commands
                return []
            else:
                print(f"⚠️  Command check failed: {response.status_code}")
                return []
                
        except requests.exceptions.Timeout:
            print(f"❌ Command check timeout")
            return []
        except Exception as e:
            # Silent fail for command checks to not spam logs
            return []
    
    def execute_command(self, command):
        """Execute command received from server"""
        cmd_type = command.get('type', '').lower()
        cmd_id = command.get('id', 'unknown')
        
        print(f"\n🎯 Command received: {cmd_type} (ID: {cmd_id})")
        
        if cmd_type == 'shutdown':
            print("⚠️  SHUTDOWN in 10 seconds... (Ctrl+C to cancel)")
            time.sleep(10)
            if platform.system() == "Windows":
                os.system("shutdown /s /t 0")
            else:
                os.system("shutdown -h now")
                
        elif cmd_type == 'restart':
            print("⚠️  RESTART in 10 seconds... (Ctrl+C to cancel)")
            time.sleep(10)
            if platform.system() == "Windows":
                os.system("shutdown /r /t 0")
            else:
                os.system("shutdown -r now")
                
        elif cmd_type == 'stop':
            print("🛑 Stopping client...")
            self.running = False
            
        elif cmd_type == 'update_interval':
            new_interval = command.get('value', 10)
            print(f"⏱️  Interval changed to {new_interval}s")
            self.update_interval = new_interval
            
        else:
            print(f"❓ Unknown command: {cmd_type}")
        
        # Acknowledge command
        self.acknowledge_command(cmd_id)
    
    def acknowledge_command(self, command_id):
        """Tell server that command was executed"""
        try:
            response = self.session.post(
                f"{self.server_url}/api/devices/{self.device_id}/commands/{command_id}/ack",
                json={"status": "executed", "timestamp": datetime.now().isoformat()},
                timeout=10,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                print(f"✅ Command {command_id} acknowledged")
            else:
                print(f"⚠️  Failed to acknowledge command {command_id}: {response.status_code}")
        except Exception as e:
            print(f"❌ Error acknowledging command: {e}")
    
    def run(self):
        """Main loop - send data and check for commands"""
        print("=" * 60)
        print("🚀 Laptop Monitor Client for Next.js")
        print("=" * 60)
        print(f"📡 Server: {self.server_url}")
        print(f"🆔 Device: {self.device_id}")
        print(f"⏱️  Interval: {self.update_interval}s")
        print("Press Ctrl+C to stop\n")
        
        self.running = True
        
        while self.running:
            try:
                # Send laptop data
                self.send_data()
                
                # Check for commands
                self.check_commands()
                
                # Wait
                time.sleep(self.update_interval)
                
            except KeyboardInterrupt:
                print("\n\n👋 Stopped by user")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(self.update_interval)


def main():
    """Run the client"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Laptop Monitor Client for Next.js')
    parser.add_argument('--server', type=str, default='http://localhost:3000',
                        help='Next.js server URL (default: http://localhost:3000)')
    parser.add_argument('--interval', type=int, default=10,
                        help='Update interval in seconds (default: 10)')
    parser.add_argument('--device-id', type=str, default=None,
                        help='Device ID (auto-generated if not provided)')
    
    args = parser.parse_args()
    
    client = SimpleClient(
        server_url=args.server,
        device_id=args.device_id,
        update_interval=args.interval
    )
    
    try:
        client.run()
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")


if __name__ == "__main__":
    main()
