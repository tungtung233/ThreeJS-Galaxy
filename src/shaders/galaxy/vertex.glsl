uniform float uSize;
uniform float uTime;

attribute float aScale;

varying vec3 vColor;

void main() {
  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Spin
  float angle = atan(modelPosition.x, modelPosition.z);
  float distanceToCenter = length(modelPosition.xz);
  float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2; //particles closer to the center will rotate faster
  angle += angleOffset;
  modelPosition.x = cos(angle) * distanceToCenter;
  modelPosition.z = sin(angle) * distanceToCenter;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // Size
  gl_PointSize = uSize * aScale;

  // Add size attenuation - particles close to camera are bigger, particles further are smaller -> simulates perspective
  gl_PointSize *= ( 1.0 / - viewPosition.z );

  // Color
  vColor = color;
}