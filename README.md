# Distributed Load Balancing Deployment with Nginx and Docker

This repository contains the necessary configurations and code to deploy a distributed application with two backend services (`fib-server` and `nau-server`) across multiple machines, managed by an Nginx load balancer.

## 🚀 Setup for 3 Physical Machines

The setup distributes services as follows:
*   **Machine 1 (IP: 192.168.1.20):** Runs `fib-server` and `nau-server`
*   **Machine 2 (IP: 192.168.1.21):** Runs `fib-server` and `nau-server`
*   **Machine 3 (IP: 192.168.1.22):** Runs Nginx Load Balancer

---

### **Step 1: Install Docker on all 3 machines**

On **all three machines**, execute the following commands to install Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

### **Step 2: Copy code to each machine**

**On Machine 1 (192.168.1.20) and Machine 2 (192.168.1.21):**

Copy the `fib-server` and `nau-server` directories:

```bash
# From your local machine (where this repo is cloned)
scp -r fib-server nau-server user@192.168.1.20:~/
scp -r fib-server nau-server user@192.168.1.21:~/
```

**On Machine 3 (192.168.1.22):**

Copy the Nginx configuration and the load balancer Docker Compose file:

```bash
# From your local machine
scp -r nginx docker-compose-lb.yml user@192.168.1.22:~/
```

---

### **Step 3: Update Load Balancer IPs (on Machine 3)**

On **Machine 3 (192.168.1.22)**, edit the `docker-compose-lb.yml` file. Update the `extra_hosts` section to reflect the actual LAN IPs of Machine 1 and Machine 2:

```yaml
# ~/docker-compose-lb.yml (on Machine 3)
services:
  load-balancer:
    # ...
    extra_hosts:
      - "machine1:192.168.1.20"  # <--- UPDATE WITH ACTUAL IP OF MACHINE 1
      - "machine2:192.168.1.21"  # <--- UPDATE WITH ACTUAL IP OF MACHINE 2
```

---

### **Step 4: Run services on each machine**

**On Machine 1 (192.168.1.20):**

```bash
cd ~
docker-compose -f docker-compose-machine1.yml up -d --build
docker ps  # Verify containers are running
curl http://localhost:3001/health # Check fib-server health
curl http://localhost:3002/health # Check nau-server health
```

**On Machine 2 (192.168.1.21):**

```bash
cd ~
docker-compose -f docker-compose-machine2.yml up -d --build
docker ps  # Verify containers are running
curl http://localhost:3001/health # Check fib-server health
curl http://localhost:3002/health # Check nau-server health
```

**On Machine 3 (192.168.1.22):**

```bash
cd ~
docker-compose -f docker-compose-lb.yml up -d
docker logs -f load-balancer  # Monitor Nginx logs
```

---

### **Step 5: Test from a client machine (any machine with `curl` and `jq`)**

**Test Load Balancer status:**

```bash
curl http://192.168.1.22:8080/lb-status
# Expected output: Load Balancer OK
```

**Test Load Balancing (call `/fib/10` 10 times and observe server distribution):**

```bash
for i in {1..10}; do
  curl -s http://192.168.1.22:8080/fib/10 | grep -o '"server":"[^"]*"'
done
# Expected result: "machine-1" and "machine-2" should appear alternately.
```

**Test Failover (stop a backend service and observe automatic switch):**

```bash
# SSH into Machine 1 and stop its fib-server
ssh user@192.168.1.20 "docker stop fib-server-m1"

# Now, call the fib endpoint again from the client machine
curl http://192.168.1.22:8080/fib/10
# Expected: The request should still succeed and be handled by "machine-2".
```

---

## 🎬 **Demo Scripts for Presentation**

### **Script 1: Show Load Balancing Distribution**

This script calls the `/fib/100` endpoint 20 times and counts how many requests were handled by each server.

```bash
for i in {1..20}; do
  curl -s http://192.168.1.22:8080/fib/100 | jq -r '.server'
done | sort | uniq -c

# Expected output (approximate):
#   10 machine-1
#   10 machine-2
```

### **Script 2: Show Failover Capability**

This script demonstrates that the system remains functional even if one backend server goes down.

```bash
# SSH into Machine 1 and stop its fib-server
ssh user@192.168.1.20 "docker stop fib-server-m1"

# Call the fib endpoint 10 times – all requests should go to machine-2
for i in {1..10}; do
  curl -s http://192.168.1.22:8080/fib/10 | jq -r '.server'
done
# Expected output: ALL responses should show "machine-2"
```

### **Script 3: Show Load Balancer Logs**

Monitor the Nginx load balancer logs to see which backend handled each request.

```bash
# On Machine 3
docker logs -f load-balancer | grep "Backend:"
# Expected: You will see entries indicating requests being routed to "192.168.1.20:3001" or "192.168.1.21:3001"
```

---

## ⚠️ **Important Notes**

### **1. Firewall Configuration**

Ensure the necessary ports are open on each machine:

**On Machine 1 and Machine 2:**
```bash
sudo ufw allow 3001/tcp  # For fib-server
sudo ufw allow 3002/tcp  # For nau-server
sudo ufw enable          # Enable firewall if not already
```

**On Machine 3:**
```bash
sudo ufw allow 8080/tcp  # For Nginx Load Balancer
sudo ufw enable          # Enable firewall if not already
```

### **2. Check Network Connectivity**

From Machine 3, verify connectivity to Machine 1 and Machine 2:

```bash
# Ping machines
ping 192.168.1.20
ping 192.168.1.21

# Test port connectivity
telnet 192.168.1.20 3001
telnet 192.168.1.21 3001
telnet 192.168.1.20 3002
telnet 192.168.1.21 3002
```

---

## 📊 **Monitoring (Optional)**

If you have a `monitor.sh` script (not included in this repository by default), you can run it for real-time monitoring:

```bash
chmod +x monitor.sh
./monitor.sh
```

---

## ✅ **Final Checklist**

Before demonstrating or testing, ensure the following:

*   ✅ Docker is installed and running on all 3 machines.
*   ✅ IPs are correctly updated in `docker-compose-lb.yml` on Machine 3.
*   ✅ Firewall rules are configured on all machines (ports 3001, 3002 on Machine 1 & 2; port 8080 on Machine 3).
*   ✅ `fib-server` and `nau-server` directories are copied to Machine 1 & 2.
*   ✅ `nginx` directory and `docker-compose-lb.yml` are copied to Machine 3.
*   ✅ Nginx `nginx.conf` correctly references `machine1` and `machine2` hostnames (these are resolved via `extra_hosts` in `docker-compose-lb.yml`).
