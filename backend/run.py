from app import create_app

app = create_app()

if __name__ == "__main__":
    # 0.0.0.0 so devices on the same network (a phone running the mobile
    # app via Expo Go, an Android emulator, etc.) can reach this dev
    # server — the Flask default of 127.0.0.1 only accepts connections
    # from this machine itself.
    app.run(host="0.0.0.0", port=5000, debug=True)
