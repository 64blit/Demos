import http.server
import sys
import os
import threading
import time
import signal

# Creat Custom Request Handler with nonblocking kill server endpoint

class CustomRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS header to every response
        self.send_header("Access-Control-Allow-Origin", "*")
    
        # Add Cache-Control header to every response
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0")

        # Add Pragma header to every response
        self.send_header("Pragma", "no-cache")

        # Add Expires header to every response
        self.send_header("Expires", "0")

        # Add clear site data header to every response
        self.send_header("Clear-Site-Data", "*")

        http.server.SimpleHTTPRequestHandler.end_headers(self)

    # Override the guess_type method to handle JavaScript files
    def guess_type(self, path):
        if path.endswith(".js"):
            return "application/javascript"
        return super().guess_type(path)

    # Adds a custom do_GET method to handle requests and adds a kill server endpoint

    def do_GET(self):
        if self.path.startswith("/kill"):
            print("Terminate server request received")
            kill_server()

        else:
            # Handle the request as normal
            return super().do_GET()

    def handle(self):
        # makes all requests nonblocking
        try:
            self.request.settimeout(1)
            return super().handle()
        except:
            self.server.server_close()


# Function to handle termination signal


class StoppableHTTPServer(http.server.HTTPServer):
    def run(self):
        try:
            self.serve_forever()
        except Exception as error1:
            print("Server error: ", error1)
        finally:
            # Clean-up server (close socket, etc.)
            self.server_close()


def kill_server():
    print("Terminating the server...")

    print("Killing the server...")

    # free the port and stop the server
    server.server_close()

    print("Server closed.")
    print("Exiting now.")
    # Terminate the main thread
    os.kill(os.getpid(), signal.SIGINT)
    # sys.exit(0)

port_number = 8430

# open a file found in the same directory as this python file
# and read the port number from it
try:
    with open(os.path.join(os.path.dirname(__file__), "portNumber"), "r") as f:
        if(f is not None):
            port_number = int(f.read().strip())
except FileNotFoundError:
    print("Failed to get port number from file. Using default port number.")
    pass
    
try:
    with open(os.path.join(os.path.dirname(__file__), "prefs"), "r") as f:
        if(f is not None):
            port_number = int(f.read().split()[2])
            
except FileNotFoundError:
    print("Failed to get port number from file. Using default port number.")
    pass

server = StoppableHTTPServer(('', port_number),
                             CustomRequestHandler)

signal.signal(signal.SIGINT, kill_server)

server_thread = threading.Thread(None, server.run)
print("Server running at http://localhost:", port_number)

try:

    server_thread.start()
    server_thread.join()

    while server_thread.is_alive():
        time.sleep(10000)

except Exception as error1:
    print("Error: unable to start thread", error1)
