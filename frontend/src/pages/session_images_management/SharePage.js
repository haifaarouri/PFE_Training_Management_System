import React, { useState } from "react";
import axios from "../../services/axios";

function SharePage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleShare = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      setMessage("No access token available. Please login again.");
      return;
    }

    setLoading(true);
    axios
      .post("https://api.linkedin.com/v2/shares", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            contentEntities: [
              {
                entityLocation: "https://example.com", // URL of the content to share
                thumbnails: [
                  {
                    resolvedUrl: "https://example.com/thumbnail.jpg",
                  },
                ],
              },
            ],
            title: content,
          },
          distribution: {
            linkedInDistributionTarget: {},
          },
          owner: `urn:li:person:${sessionStorage.getItem("personURN")}`,
          text: {
            text: content,
          },
        }),
      })
      .then((response) => {
        setMessage("Content shared successfully!");
        setLoading(false);
      })
      .catch((error) => {
        setMessage("Failed to share content. Error: " + error.message);
        setLoading(false);
      });
  };

  return (
    <div>
      <h1>Share on LinkedIn</h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write something to share..."
      />
      <button onClick={handleShare} disabled={loading}>
        {loading ? "Sharing..." : "Share"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SharePage;
