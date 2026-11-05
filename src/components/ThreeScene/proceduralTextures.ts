import * as THREE from 'three';

/**
 * Genera una textura procedural suave de sombra de contacto (radial contact shadow)
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.45)');
  gradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Textura procedural de rejilla holográfica para el suelo
 */
export function createCyberGridTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, size, size);

  // Rejilla sutil
  ctx.strokeStyle = 'rgba(79, 70, 229, 0.15)';
  ctx.lineWidth = 1;

  const step = 32;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Círculos concéntricos de radar
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.24, 0, Math.PI * 2);
  ctx.stroke();

  // Marcas de coordenadas
  ctx.fillStyle = 'rgba(129, 140, 248, 0.5)';
  ctx.font = '10px monospace';
  ctx.fillText('STREAM·CORE · v3.0', 16, 26);
  ctx.fillText('SYS·ONLINE · 60FPS', size - 140, size - 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Genera texturas procedurales para los nodos de streaming holográficos
 */
export function createPlatformBadgeTexture(
  title: string,
  accentColor: string,
  category: string,
): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Fondo glassmorphic oscuro con bisel
  ctx.fillStyle = '#101016';
  ctx.fillRect(0, 0, width, height);

  // Borde brillante con el color de acento
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  // Resplandor superior
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, `${accentColor}33`);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(10, 10, width - 20, height - 20);

  // Categoría en letra pequeña
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(category.toUpperCase(), 32, 54);

  // Nombre de la plataforma
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 48px system-ui, sans-serif';
  ctx.fillText(title, 32, 120);

  // Barra de estado de transmisión
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(32, 150, width - 64, 10);
  ctx.fillStyle = accentColor;
  ctx.fillRect(32, 150, (width - 64) * 0.85, 10);

  // Indicador activo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '600 20px monospace';
  ctx.fillText('LIVE STREAMING NODE · ACTIVE', 32, 205);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Textura procedural de disco de control con marcas grabadas (anillos milimétricos)
 */
export function createDialTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1a1a24';
  ctx.fillRect(0, 0, size, size);

  ctx.translate(size / 2, size / 2);

  // Marcas radiales
  const totalTicks = 72;
  for (let i = 0; i < totalTicks; i++) {
    const angle = (i * Math.PI * 2) / totalTicks;
    const isMajor = i % 6 === 0;
    const inner = isMajor ? size * 0.35 : size * 0.4;
    const outer = size * 0.46;

    ctx.strokeStyle = isMajor ? '#6366f1' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = isMajor ? 3 : 1.5;

    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
