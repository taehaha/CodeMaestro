import { useEffect, useRef } from 'react';
import './WaveComponent.css';

function WaveComponent() {
  const canvasRef = useRef(null);
  let phases = [0, 0, 0]; // 각 파도의 개별적인 위상

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const waves = [
      { height: 35, speed: 0.015, color: 'rgba(24, 38, 57, 0.8)', offset: 0, frequency: 0.6, amplitude: 10 },
      { height: 25, speed: 0.02, color: 'rgba(24, 38, 57, 0.8)', offset: Math.PI / 2, frequency: 0.4, amplitude: 15 },
      { height: 25, speed: 0.01, color: 'rgba(24, 38, 57, 0.8)', offset: Math.PI, frequency: 0.5, amplitude: 20 },
    ];

    function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  waves.forEach((wave, index) => {
    ctx.beginPath();
    const numberOfPoints = 25;
    const points = [];

    for (let i = 0; i < numberOfPoints; i++) {
      const x = (i / (numberOfPoints - 1)) * canvas.width;
      const y =
        Math.sin(i * wave.frequency - phases[index] + wave.offset) * wave.height +
        Math.cos(i * wave.frequency / 2 + phases[index]) * wave.amplitude +
        canvas.height / 2;

      points.push({ x, y });
    }

    let prevX = points[0].x;
    let prevY = points[0].y;
    ctx.moveTo(prevX, prevY);

    for (let i = 1; i < numberOfPoints; i++) {
      const cx = (prevX + points[i].x) / 2;
      const cy = (prevY + points[i].y) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cx, cy);
      prevX = points[i].x;
      prevY = points[i].y;
    }

    ctx.lineTo(prevX, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(points[0].x, points[0].y);

    // 🔥 하단이 #182235로 자연스럽게 이어지도록 그라데이션 적용
    const gradient = ctx.createLinearGradient(0, canvas.height * 0.8, 0, canvas.height);
    gradient.addColorStop(0, wave.color);
    gradient.addColorStop(1, '#182235'); // Contents 배경색과 일치

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
  });
}


    function animate() {
      // 각 파도의 속도에 따라 개별적으로 움직이게 설정
      waves.forEach((wave, index) => {
        phases[index] += wave.speed;
      });

      draw();
      requestAnimationFrame(animate);
    }

    animate();

    const resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 120, left: 0, width: '120%', height: '765' }}
    />
  );
}

export default WaveComponent;
