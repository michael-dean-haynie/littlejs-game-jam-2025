import alea from "alea";
import { clamp, percent, vec2, type Vector2 } from "littlejsengine";
import { createNoise2D } from "simplex-noise";

export function generateNoiseMap(
  seed: unknown,
  mapWidth: number,
  mapHeight: number,
  scale: number,
  octaves: number,
  persistance: number,
  lacunarity: number,
  offset: Vector2, // for scrolling and sector offsets
  // this is for discarding the extremes of the theoretically possible noise values
  // they are almost never actually reached because they would require perfect constructive/destructive interference of the octaves layering
  // this can help keep the dynamic interesting part of the noise from being too thin
  clampPct: number, // form 0 to 1. percentage of whole theoretical amplitude space
): number[][] {
  const noiseMap: number[][] = Array.from({ length: mapWidth }, () =>
    Array(mapHeight).fill(0),
  );
  const prng = alea(seed);
  const noise2D = createNoise2D(prng);

  const octaveOffsets: Vector2[] = new Array(octaves);

  for (let i = 0; i < octaves; i++) {
    const offsetX = prng.next();
    const offsetY = prng.next();
    octaveOffsets[i] = vec2(offsetX, offsetY);
  }

  if (scale <= 0) {
    scale = 0.0001;
  }

  let maxAmplitude;
  if (persistance === 1) {
    maxAmplitude = octaves;
  } else {
    maxAmplitude = (1 - Math.pow(persistance, octaves)) / (1 - persistance);
  }
  const clampMin = -maxAmplitude + maxAmplitude * clampPct;
  const clampMax = maxAmplitude - maxAmplitude * clampPct;

  const halfWidth = mapWidth / 2;
  const halfHeight = mapHeight / 2;

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      let amplitude = 1;
      let frequency = 1;
      let noiseHeight = 0;

      for (let i = 0; i < octaves; i++) {
        const sampleX =
          ((x - halfWidth) / scale + offset.x / scale) * frequency +
          octaveOffsets[i].x;
        const sampleY =
          ((y - halfHeight) / scale + offset.y / scale) * frequency +
          octaveOffsets[i].y;

        const simplexValue = noise2D(sampleX, sampleY);
        noiseHeight += simplexValue * amplitude;

        amplitude *= persistance;
        frequency *= lacunarity;
      }

      noiseMap[x][y] = clamp(noiseHeight, clampMin, clampMax);
    }
  }

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      noiseMap[x][y] = percent(noiseMap[x][y], clampMin, clampMax);
    }
  }

  // michael: debug: for visualizing the clamp
  // dotPlot(noiseMap.flat());

  return noiseMap;
}

// function dotPlot(values: number[], width: number = 50): void {
//   const line = new Array(width + 1).fill("·");

//   values.forEach((v) => {
//     const pos = Math.round(v * width);
//     line[pos] = "●";
//   });

//   console.log("0" + line.join("") + "1");
//   console.log("|" + " ".repeat(width) + "|");
// }
