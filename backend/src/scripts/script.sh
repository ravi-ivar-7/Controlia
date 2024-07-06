#!/bin/bash

# Login to azure and start vm
# az login
# az vm start --resource-group cpp --name cppvm

# Login to VM
sudo ssh -i cppvm.pem ravi@20.40.47.132 << 'EOF'
    echo "Connected to vm"
    cd cppvm
    echo "Changed directory to cppvm"

    # Ensure previous log file is removed
    rm -f server.log
    touch server.log
    echo "Created new server.log file"

    # Run server and capture output
    ./server > server.log 2>&1 &  # Run server in background and redirect output to log file
    server_pid=$!  # Store the PID of the background process in the variable server_pid
    echo "Started server with PID $server_pid"

    # Check server startup (optional)
    sleep 2  # Wait for server to start

    # Check if server is running on port 8080
    if netstat -tuln | grep ':8080 ' >/dev/null; then
        echo "Server started successfully on port 8080"
        # Add further actions or commands based on the condition
    else
        echo "Server did not start on port 8080. Check server logs for details."
        # Add error handling or additional commands as needed
    fi

    # tail -f server.log # continously display new log

    # Monitor server log for BOOST SYSTEM ERROR
    tail -f server.log | while read -r line; do
        echo "$line"  # Display new log lines
        if echo "$line" | grep -q 'BOOST SYSTEM ERROR'; then
            echo "BOOST ERROR detected"
            kill $server_pid  # Optionally stop the server
            exit 1  # Exit with error code
        fi
    done

EOF




