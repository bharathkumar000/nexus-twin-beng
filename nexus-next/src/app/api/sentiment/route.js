import { NextResponse } from 'next/server';

export async function POST() {
  const sentimentPoints = [];
  const numPoints = 100;

  for (let i = 0; i < numPoints; i++) {
    const sentiment = Math.random() * 2 - 1;
    sentimentPoints.push({
      id: i,
      coordinates: [
        77.57 + Math.random() * 0.06,
        12.95 + Math.random() * 0.05
      ],
      sentiment: sentiment,
      intensity: Math.random()
    });
  }

  return NextResponse.json({ points: sentimentPoints });
}
