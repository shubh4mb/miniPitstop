import { useState, useRef } from "react";

const MagnifyImage = ({ src, alt }) => {
  const [backgroundStyle, setBackgroundStyle] = useState({
    backgroundPosition: "center",
    backgroundSize: "100%",
  });

  const animationFrameRef = useRef(null);

  const handleMouseMove = (e) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const { left, top, width, height } = e.target.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;

      setBackgroundStyle({
        backgroundPosition: `${x}% ${y}%`,
        backgroundSize: "200%",
      });
    });
  };

  const handleMouseLeave = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setBackgroundStyle({
      backgroundPosition: "center",
      backgroundSize: "100%",
    });
  };

  return (
    <div
      className="aspect-square overflow-hidden rounded-lg relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundImage: `url(${src})`,
        backgroundPosition: `${backgroundStyle.backgroundPosition}`,
        backgroundSize: backgroundStyle.backgroundSize,
        backgroundRepeat: "no-repeat",
        transition: "background-size 0.5s ease, background-position 0.5s ease", // Smooth transitions
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover opacity-0" // Hidden but accessible for SEO
      />
    </div>
  );
};

export default MagnifyImage;