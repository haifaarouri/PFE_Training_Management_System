import Echo from "laravel-echo";
import axios from "./axios";
require("pusher-js");

const token = localStorage.getItem("token");

function getCsrfTokenFromCookies() {
  // Decode cookies to handle encoded characters
  const decodedCookies = decodeURIComponent(document.cookie);
  // Split cookies string into individual cookies
  const cookies = decodedCookies.split(";");
  // Look for the XSRF-TOKEN cookie and return its value
  const xsrfToken = cookies.find((cookie) =>
    cookie.trim().startsWith("XSRF-TOKEN=")
  );
  if (xsrfToken) {
    // Split the cookie string by '=' and return the value part
    return xsrfToken.split("=")[1];
  }
  return null; // Return null if the token is not found
}

const csrfToken = getCsrfTokenFromCookies();

let pusher;

//open connection with WS => all authenticated users can make this connection with WS
if (token) {
  pusher = new Echo({
    broadcaster: "pusher",
    key: "LaravelWebSocketKey",
    wsHost: window.location.hostname,
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    cluster: "mt1",
    encrypted: true,
    withCredentials: true,
    authEndpoint: "http://localhost:8000/broadcasting/auth",
    auth: {
      headers: {
        Authorization: window.localStorage.getItem("token")
          ? `Bearer ${token}`
          : `Bearer ${csrfToken}`,
        "Access-Control-Allow-Credentials": true,
        Accept: "application/json",
      },
    },
    enabledTransports: ["ws", "wss"],
  });
} else {
  const headers = {
    "Content-Type": "application/json",
    Authorization: window.localStorage.getItem("token")
      ? `Bearer ${window.localStorage.getItem("token")}`
      : "",
    "Access-Control-Allow-Credentials": true,
    "X-CSRF-TOKEN": csrfToken,
  };

  pusher = new Echo({
    broadcaster: "pusher",
    key: "LaravelWebSocketKey",
    // wsHost: window.location.hostname,
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: false,
    disableStats: true,
    cluster: "mt1",
    encrypted: true,
    withCredentials: true,
    wsHost: "127.0.0.1",
    authEndpoint: "http://localhost:8000/api/broadcasting/auth",
    auth: {
      headers: {
        "Access-Control-Allow-Credentials": true,
        Accept: "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
    },
    enabledTransports: ["ws", "wss"],
    authorizer: (channel, options) => {
      return {
        authorize: (socketId, callback) => {
          axios
            .post(
              "http://localhost:8000/api/broadcasting/auth",
              {
                socket_id: socketId,
                channel_name: channel.name,
              },
              { headers, withCredentials: true }
            )
            .then((response) => {
              callback(false, response.data);
            })
            .catch((error) => {
              callback(true, error);
            });
        },
      };
    },
  });
}

export default pusher;
