import { useEffect, useState } from "react";
import "./App.css";
import images from "./assets/images";
import "boxicons";

function App() {
  const [likes, setLikes] = useState(images.map(() => 0));
  const [dislikes, setDislikes] = useState(images.map(() => 0));
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [emoji, setEmoji] = useState(null);
  const [emojiType, setEmojiType] = useState(null);
  const [lastEmojiType, setLastEmojiType] = useState(null);

  const totalImages = images.length;

  const extendedImages = [images[totalImages - 1], ...images, images[0]];

  const titles = [
    "Chikker",
    "Espresso",
    "Hamburger",
    "McCrispy",
    "Iced Raspberry & White Choco Latte",
    "Kawa z Mlekiem",
    "Herbata",
    "Iced Caramel Latte",
    "WieśMac Double",
  ];

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4001");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (!isTransitioning) {
        if (data.gesture === "POINT:RIGHT" || data.gesture === "SWIPE:RIGHT") {
          moveSlide(-1);
        } else if (
          data.gesture === "POINT:LEFT" ||
          data.gesture === "SWIPE:LEFT"
        ) {
          moveSlide(1);
        } else if (data.gesture === "THUMB:UP" && lastEmojiType !== "blue") {
          showEmoji("👍", "blue");
          updateLikes(currentIndex - 1);
          setLastEmojiType("blue");
        } else if (data.gesture === "THUMB:DOWN" && lastEmojiType !== "red") {
          showEmoji("👎", "red");
          updateDislikes(currentIndex - 1);
          setLastEmojiType("red");
        } else if (
          data.gesture !== "THUMB:UP" &&
          data.gesture !== "THUMB:DOWN"
        ) {
          setLastEmojiType(null);
        }
      }
    };

    return () => ws.close();
  }, [isTransitioning, lastEmojiType, currentIndex]);

  const moveSlide = (direction) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    let newIndex = currentIndex + direction;

    setCurrentIndex(newIndex);

    setTimeout(() => {
      if (newIndex === 0) {
        setCurrentIndex(totalImages);
      } else if (newIndex === totalImages + 1) {
        setCurrentIndex(1);
      }

      setIsTransitioning(false);
    }, 1500);
  };

  const updateLikes = (index) => {
    const newLikes = [...likes];
    newLikes[index] += 1;
    setLikes(newLikes);
  };

  const updateDislikes = (index) => {
    const newDislikes = [...dislikes];
    newDislikes[index] += 1;
    setDislikes(newDislikes);
  };

  const showEmoji = (emojiChar, color) => {
    setEmoji(emojiChar);
    setEmojiType(color);
    setTimeout(() => {
      setEmoji(null);
    }, 1500);
  };

  return (
    <div className="gallery">
      <div
        className="gallery-container"
        style={{
          transform: `translateX(${-currentIndex * 100}%)`,
          transition: isTransitioning ? "transform 0.5s ease" : "none",
        }}
      >
        {extendedImages.map((image, index) => (
          <div className="gallery-item" key={index}>
            <img
              src={image}
              alt={`Zdjęcie ${index + 1}`}
              className="gallery-item-img"
            />
          </div>
        ))}
      </div>

      {}
      <h2 className="gallery-title">
        {titles[(currentIndex - 1 + totalImages) % totalImages]}
      </h2>

      <div className="emoji-counts">
        <span className="like-count">
          <box-icon type="solid" name="like" size="180px"></box-icon>{" "}
          {likes[(currentIndex - 1 + totalImages) % totalImages]}
        </span>
        <span className="dislike-count">
          <box-icon name="dislike" type="solid" size="180px"></box-icon>
          {dislikes[(currentIndex - 1 + totalImages) % totalImages]}
        </span>
      </div>
      {/* <button className="prev" onClick={() => moveSlide(-1)}>
        &#10094;
      </button>
      <button className="next" onClick={() => moveSlide(1)}>
        &#10095;
      </button> */}
      {emoji && (
        <div
          className={`emoji-popup ${emojiType}`}
          style={{ animation: "pop-up 1s forwards, fade-out 1s forwards 1s" }}
        >
          {emoji}
        </div>
      )}
    </div>
  );
}

export default App;
