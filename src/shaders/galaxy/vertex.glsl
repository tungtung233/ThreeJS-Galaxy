uniform float uSize;

attribute float aScale;

void main() {
  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // Size
  gl_PointSize = uSize * aScale;

  // Add size attenuation - particles close to camera are bigger, particles further are smaller -> simulates perspective
  gl_PointSize *= ( 1.0 / - viewPosition.z );
}