import psutil
import platform
import time
import threading
from datetime import datetime
import json

class LaptopMonitor:
    """Background application to retrieve and monitor laptop data"""
    
    def __init__(self, update_interval=5):
        self.update_interval = update_interval
        self.running = False
        self.monitor_thread = None
        
    def get_system_info(self):
        """Get static system information"""
        return {
            "system": platform.system(),
            "node_name": platform.node(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
        }
    
    def get_cpu_info(self):
        """Get CPU information and usage"""
        return {
            "physical_cores": psutil.cpu_count(logical=False),
            "total_cores": psutil.cpu_count(logical=True),
            "cpu_usage_percent": psutil.cpu_percent(interval=1),
            "cpu_freq_current": psutil.cpu_freq().current if psutil.cpu_freq() else None,
            "cpu_freq_max": psutil.cpu_freq().max if psutil.cpu_freq() else None,
            "per_cpu_usage": psutil.cpu_percent(interval=1, percpu=True),
        }
    
    def get_memory_info(self):
        """Get memory (RAM) information"""
        memory = psutil.virtual_memory()
        return {
            "total_gb": round(memory.total / (1024**3), 2),
            "available_gb": round(memory.available / (1024**3), 2),
            "used_gb": round(memory.used / (1024**3), 2),
            "percent": memory.percent,
        }
    
    def get_disk_info(self):
        """Get disk information"""
        partitions = psutil.disk_partitions()
        disk_info = []
        
        for partition in partitions:
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                disk_info.append({
                    "device": partition.device,
                    "mountpoint": partition.mountpoint,
                    "fstype": partition.fstype,
                    "total_gb": round(usage.total / (1024**3), 2),
                    "used_gb": round(usage.used / (1024**3), 2),
                    "free_gb": round(usage.free / (1024**3), 2),
                    "percent": usage.percent,
                })
            except PermissionError:
                continue
        
        return disk_info
    
    def get_battery_info(self):
        """Get battery information"""
        battery = psutil.sensors_battery()
        if battery:
            battery_info = {
                "percent": battery.percent,
                "plugged_in": battery.power_plugged,
                "time_left_seconds": battery.secsleft if battery.secsleft != psutil.POWER_TIME_UNLIMITED else None,
            }
            
            # Get power/charging information if plugged in
            if battery.power_plugged:
                try:
                    # Try to get power consumption/input (Windows-specific)
                    import wmi
                    w = wmi.WMI()
                    battery_status = w.Win32_Battery()
                    if battery_status:
                        for bat in battery_status:
                            # EstimatedChargeRemaining is percentage
                            # BatteryStatus: 1=discharging, 2=AC, 3=fully charged, 4=low, 5=critical
                            battery_info["battery_status"] = bat.BatteryStatus
                            battery_info["estimated_run_time"] = bat.EstimatedRunTime if bat.EstimatedRunTime != 71582788 else None
                except ImportError:
                    # If WMI not available, try alternative method
                    pass
                except Exception:
                    pass
                    
            return battery_info
        return None
    
    def get_network_info(self):
        """Get network information"""
        net_io = psutil.net_io_counters()
        return {
            "bytes_sent": net_io.bytes_sent,
            "bytes_received": net_io.bytes_recv,
            "packets_sent": net_io.packets_sent,
            "packets_received": net_io.packets_recv,
        }
    
    def get_power_info(self):
        """Get power consumption/charging information"""
        power_info = {}
        try:
            # Try to get power information using WMI (Windows)
            import wmi
            w = wmi.WMI(namespace="root\\wmi")
            
            # Get battery full charged capacity
            battery_full_charged = w.BatteryFullChargedCapacity()
            if battery_full_charged:
                for item in battery_full_charged:
                    power_info["full_charge_capacity_mwh"] = item.FullChargedCapacity
            
            # Get battery static data (design capacity)
            battery_static = w.BatteryStaticData()
            if battery_static:
                for item in battery_static:
                    power_info["design_capacity_mwh"] = item.DesignedCapacity
                    if hasattr(item, 'DefaultAlert1'):
                        power_info["default_alert"] = item.DefaultAlert1
            
            # Get battery status (current discharge/charge rate)
            battery_status = w.BatteryStatus()
            if battery_status:
                for status in battery_status:
                    # Discharge/Charge rate in mW
                    if hasattr(status, 'DischargeRate') and status.DischargeRate:
                        rate = status.DischargeRate
                        power_info["current_rate_mw"] = rate
                        power_info["current_rate_w"] = round(rate / 1000, 2)
                    if hasattr(status, 'Voltage') and status.Voltage:
                        power_info["voltage_mv"] = status.Voltage
                        power_info["voltage_v"] = round(status.Voltage / 1000, 2)
                    if hasattr(status, 'RemainingCapacity'):
                        power_info["remaining_capacity_mwh"] = status.RemainingCapacity
                        
        except ImportError:
            power_info["error"] = "WMI not available (install: pip install wmi)"
        except Exception as e:
            power_info["error"] = str(e)
            
        return power_info if power_info else None
    
    def get_temperature_info(self):
        """Get temperature information (if available)"""
        try:
            temps = psutil.sensors_temperatures()
            if temps:
                temp_info = {}
                for name, entries in temps.items():
                    temp_info[name] = [
                        {"label": entry.label, "current": entry.current}
                        for entry in entries
                    ]
                return temp_info
        except AttributeError:
            return None
        return None
    
    def get_all_data(self):
        """Collect all laptop data"""
        data = {
            "timestamp": datetime.now().isoformat(),
            "system_info": self.get_system_info(),
            "cpu_info": self.get_cpu_info(),
            "memory_info": self.get_memory_info(),
            "disk_info": self.get_disk_info(),
            "battery_info": self.get_battery_info(),
            "power_info": self.get_power_info(),
            "network_info": self.get_network_info(),
            "temperature_info": self.get_temperature_info(),
        }
        return data
    
    def monitor_loop(self):
        """Background monitoring loop"""
        print("🚀 Laptop Monitor Started!")
        print(f"Update interval: {self.update_interval} seconds")
        print("Press Ctrl+C to stop\n")
        
        while self.running:
            try:
                data = self.get_all_data()
                self.display_data(data)
                time.sleep(self.update_interval)
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error in monitor loop: {e}")
                time.sleep(self.update_interval)
    
    def display_data(self, data):
        """Display collected data in a readable format"""
        print("\n" + "="*60)
        print(f"📊 Laptop Status - {data['timestamp']}")
        print("="*60)
        
        # CPU Info
        cpu = data['cpu_info']
        print(f"\n🖥️  CPU:")
        print(f"   Usage: {cpu['cpu_usage_percent']}%")
        print(f"   Cores: {cpu['physical_cores']} physical, {cpu['total_cores']} logical")
        if cpu['cpu_freq_current']:
            print(f"   Frequency: {cpu['cpu_freq_current']:.2f} MHz")
        
        # Memory Info
        mem = data['memory_info']
        print(f"\n💾 Memory:")
        print(f"   Total: {mem['total_gb']} GB")
        print(f"   Used: {mem['used_gb']} GB ({mem['percent']}%)")
        print(f"   Available: {mem['available_gb']} GB")
        
        # Battery Info
        if data['battery_info']:
            bat = data['battery_info']
            status = "🔌 Charging" if bat['plugged_in'] else "🔋 On Battery"
            print(f"\n{status}:")
            print(f"   Battery: {bat['percent']}%")
            
            if bat['plugged_in']:
                # Show charging status
                if bat.get('battery_status'):
                    status_map = {
                        1: "Discharging",
                        2: "Connected to AC",
                        3: "Fully Charged",
                        4: "Low Battery",
                        5: "Critical Battery"
                    }
                    print(f"   Status: {status_map.get(bat['battery_status'], 'Unknown')}")
                
                # Try to calculate approximate charging rate
                if bat['percent'] < 100:
                    print(f"   Charging...")
                else:
                    print(f"   Fully Charged")
            else:
                # Show time remaining on battery
                if bat['time_left_seconds']:
                    hours = bat['time_left_seconds'] // 3600
                    minutes = (bat['time_left_seconds'] % 3600) // 60
                    print(f"   Time Left: {hours}h {minutes}m")
        
        # Power Info (when charging)
        if data.get('power_info') and data['battery_info'] and data['battery_info']['plugged_in']:
            pwr = data['power_info']
            if pwr and not pwr.get('error'):
                print(f"\n⚡ Power Details:")
                
                # Show voltage
                if pwr.get('voltage_v'):
                    print(f"   Current Voltage: {pwr['voltage_v']} V ({pwr.get('voltage_mv', 0)} mV)")
                
                # Show charge/discharge rate
                if pwr.get('current_rate_w'):
                    rate = pwr['current_rate_w']
                    if data['battery_info']['plugged_in']:
                        if data['battery_info']['percent'] < 100:
                            print(f"   ⚡ Charging Rate: {abs(rate):.2f} W")
                        else:
                            print(f"   💡 AC Power Input: ~{abs(rate):.2f} W (maintaining charge)")
                    else:
                        print(f"   🔋 Discharge Rate: {abs(rate):.2f} W")
                
                # Show battery capacity info
                if pwr.get('design_capacity_mwh'):
                    design_wh = pwr['design_capacity_mwh'] / 1000
                    print(f"   Design Capacity: {design_wh:.2f} Wh")
                
                if pwr.get('full_charge_capacity_mwh'):
                    full_wh = pwr['full_charge_capacity_mwh'] / 1000
                    print(f"   Full Charge Capacity: {full_wh:.2f} Wh")
                    
                    # Calculate battery health
                    if pwr.get('design_capacity_mwh'):
                        health = (pwr['full_charge_capacity_mwh'] / pwr['design_capacity_mwh']) * 100
                        print(f"   Battery Health: {health:.1f}%")
                
                if pwr.get('remaining_capacity_mwh'):
                    remaining_wh = pwr['remaining_capacity_mwh'] / 1000
                    print(f"   Remaining Capacity: {remaining_wh:.2f} Wh")
            elif pwr and pwr.get('error'):
                print(f"\n⚡ Power Details: {pwr['error']}")
        
        # Disk Info
        print(f"\n💿 Disk:")
        for disk in data['disk_info']:
            print(f"   {disk['device']} ({disk['mountpoint']})")
            print(f"      {disk['used_gb']}/{disk['total_gb']} GB ({disk['percent']}%)")
        
        # Network Info
        net = data['network_info']
        print(f"\n🌐 Network:")
        print(f"   Sent: {net['bytes_sent'] / (1024**2):.2f} MB")
        print(f"   Received: {net['bytes_received'] / (1024**2):.2f} MB")
        
    def start(self):
        """Start the background monitoring"""
        if not self.running:
            self.running = True
            self.monitor_thread = threading.Thread(target=self.monitor_loop)
            self.monitor_thread.daemon = True
            self.monitor_thread.start()
    
    def stop(self):
        """Stop the background monitoring"""
        self.running = False
        if self.monitor_thread:
            self.monitor_thread.join()
    
    def save_to_file(self, filename="laptop_data.json"):
        """Save current data to a JSON file"""
        data = self.get_all_data()
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"✅ Data saved to {filename}")


def main():
    """Main function to run the laptop monitor"""
    # Create monitor instance with 5-second update interval
    monitor = LaptopMonitor(update_interval=5)
    
    # Option 1: Run in foreground with display
    try:
        monitor.running = True
        monitor.monitor_loop()
    except KeyboardInterrupt:
        print("\n\n👋 Laptop Monitor Stopped!")
    
    # Option 2: Get one-time snapshot
    # data = monitor.get_all_data()
    # print(json.dumps(data, indent=2))
    # monitor.save_to_file()


if __name__ == "__main__":
    main()
