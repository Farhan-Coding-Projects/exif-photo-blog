import { Camera, formatCameraText } from '@/camera';

// Compact camera label for tight spaces like the mobile top-entities strip,
// e.g. "Samsung Galaxy S25 Ultra" -> "S25 Ultra"
export const formatCameraTextCompact = (camera: Camera) =>
  /^samsung/i.test(camera.make)
    ? camera.model.replace(/^(samsung\s+)?(galaxy\s+)?/i, '')
    : formatCameraText(camera);
