export function generateCaptcha(width = 120, height = 40): { canvas: HTMLCanvasElement; text: string } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 背景
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200})`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // 干扰点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200})`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
    ctx.fill();
  }

  // 文字
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let text = '';
  for (let i = 0; i < 4; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    text += char;
    ctx.font = `${20 + Math.random() * 10}px Arial`;
    ctx.fillStyle = `rgb(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150})`;
    ctx.save();
    ctx.translate(20 + i * 25, 28);
    ctx.rotate(((Math.random() - 0.5) * Math.PI) / 6);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  return { canvas, text };
}
