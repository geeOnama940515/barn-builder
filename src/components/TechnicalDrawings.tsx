import { jsPDF } from 'jspdf';
import type { BuildingDimensions, WallFeature } from '../types';

const scale = 15; // Reduced scale for more compact drawings

const drawFloorPlan = (ctx: CanvasRenderingContext2D, dimensions: BuildingDimensions, features: WallFeature[]) => {
  const width = dimensions.width * scale;
  const length = dimensions.length * scale;
  
  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 0.5;
  
  // Vertical grid lines
  for (let x = -width/2; x <= width/2; x += scale) {
    ctx.beginPath();
    ctx.moveTo(x, -length/2);
    ctx.lineTo(x, length/2);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let y = -length/2; y <= length/2; y += scale) {
    ctx.beginPath();
    ctx.moveTo(-width/2, y);
    ctx.lineTo(width/2, y);
    ctx.stroke();
  }
  
  // Draw walls
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(-width/2, -length/2, width, length);
  
  // Draw wall thickness
  ctx.fillStyle = '#000';
  const wallThickness = scale * 0.5;
  
  // Top and bottom walls
  ctx.fillRect(-width/2, -length/2, width, wallThickness);
  ctx.fillRect(-width/2, length/2 - wallThickness, width, wallThickness);
  
  // Left and right walls
  ctx.fillRect(-width/2, -length/2, wallThickness, length);
  ctx.fillRect(width/2 - wallThickness, -length/2, wallThickness, length);
  
  // Draw features
  features.forEach(feature => {
    const featureWidth = feature.width * scale;
    const featureDepth = scale * 0.5;
    let x = 0;
    let y = 0;
    
    switch (feature.position.wallPosition) {
      case 'front':
        x = (feature.position.alignment === 'left')
          ? -width/2 + feature.position.xOffset * scale
          : (feature.position.alignment === 'right')
            ? width/2 - (feature.position.xOffset * scale) - featureWidth
            : -featureWidth/2 + (feature.position.xOffset * scale);
        y = length/2 - featureDepth;
        break;
      case 'back':
        x = (feature.position.alignment === 'left')
          ? -width/2 + feature.position.xOffset * scale
          : (feature.position.alignment === 'right')
            ? width/2 - (feature.position.xOffset * scale) - featureWidth
            : -featureWidth/2 + (feature.position.xOffset * scale);
        y = -length/2;
        break;
      case 'left':
        y = (feature.position.alignment === 'left')
          ? -length/2 + feature.position.xOffset * scale
          : (feature.position.alignment === 'right')
            ? length/2 - (feature.position.xOffset * scale) - featureWidth
            : -featureWidth/2 + (feature.position.xOffset * scale);
        x = -width/2;
        break;
      case 'right':
        y = (feature.position.alignment === 'left')
          ? -length/2 + feature.position.xOffset * scale
          : (feature.position.alignment === 'right')
            ? length/2 - (feature.position.xOffset * scale) - featureWidth
            : -featureWidth/2 + (feature.position.xOffset * scale);
        x = width/2 - featureDepth;
        break;
    }
    
    ctx.fillStyle = '#2563eb';
    if (feature.position.wallPosition === 'front' || feature.position.wallPosition === 'back') {
      ctx.fillRect(x, y, featureWidth, featureDepth);
    } else {
      ctx.fillRect(x, y, featureDepth, featureWidth);
    }
  });
  
  // Draw dimensions
  const drawDimensionLine = (x1: number, y1: number, x2: number, y2: number, text: string) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw arrows
    const arrowSize = 5;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // Start arrow
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize * Math.cos(angle + Math.PI/6), y1 + arrowSize * Math.sin(angle + Math.PI/6));
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize * Math.cos(angle - Math.PI/6), y1 + arrowSize * Math.sin(angle - Math.PI/6));
    ctx.stroke();
    
    // End arrow
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI/6), y2 - arrowSize * Math.sin(angle + Math.PI/6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI/6), y2 - arrowSize * Math.sin(angle - Math.PI/6));
    ctx.stroke();
    
    // Draw text
    ctx.save();
    ctx.scale(1, -1);
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textX = (x1 + x2) / 2;
    const textY = -((y1 + y2) / 2);
    ctx.fillStyle = '#000';
    ctx.fillText(text, textX, textY);
    ctx.restore();
  };
  
  // Width dimension
  drawDimensionLine(
    -width/2, length/2 + 15,
    width/2, length/2 + 15,
    `${dimensions.width}'`
  );
  
  // Length dimension
  drawDimensionLine(
    width/2 + 15, -length/2,
    width/2 + 15, length/2,
    `${dimensions.length}'`
  );
};

const drawFrontElevation = (ctx: CanvasRenderingContext2D, dimensions: BuildingDimensions, features: WallFeature[]) => {
  const width = dimensions.width * scale;
  const height = dimensions.height * scale;
  const roofHeight = (dimensions.width / 2) * (dimensions.roofPitch / 12) * scale;
  
  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 0.5;
  
  // Vertical grid lines
  for (let x = -width/2; x <= width/2; x += scale) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height + roofHeight);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let y = 0; y <= height + roofHeight; y += scale) {
    ctx.beginPath();
    ctx.moveTo(-width/2, y);
    ctx.lineTo(width/2, y);
    ctx.stroke();
  }
  
  // Draw walls
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(-width/2, 0, width, height);
  
  // Draw roof
  ctx.beginPath();
  ctx.moveTo(-width/2, height);
  ctx.lineTo(0, height + roofHeight);
  ctx.lineTo(width/2, height);
  ctx.stroke();
  
  // Draw features
  features.filter(f => f.position.wallPosition === 'front').forEach(feature => {
    const featureWidth = feature.width * scale;
    const featureHeight = feature.height * scale;
    let x = (feature.position.alignment === 'left')
      ? -width/2 + feature.position.xOffset * scale
      : (feature.position.alignment === 'right')
        ? width/2 - (feature.position.xOffset * scale) - featureWidth
        : -featureWidth/2 + (feature.position.xOffset * scale);
    
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x, feature.position.yOffset * scale, featureWidth, featureHeight);
  });
  
  // Draw dimensions
  const drawDimensionLine = (x1: number, y1: number, x2: number, y2: number, text: string) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw arrows
    const arrowSize = 5;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // Start arrow
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize * Math.cos(angle + Math.PI/6), y1 + arrowSize * Math.sin(angle + Math.PI/6));
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize * Math.cos(angle - Math.PI/6), y1 + arrowSize * Math.sin(angle - Math.PI/6));
    ctx.stroke();
    
    // End arrow
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI/6), y2 - arrowSize * Math.sin(angle + Math.PI/6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI/6), y2 - arrowSize * Math.sin(angle - Math.PI/6));
    ctx.stroke();
    
    // Draw text
    ctx.save();
    ctx.scale(1, -1);
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textX = (x1 + x2) / 2;
    const textY = -((y1 + y2) / 2);
    ctx.fillStyle = '#000';
    ctx.fillText(text, textX, textY);
    ctx.restore();
  };
  
  // Width dimension
  drawDimensionLine(
    -width/2, -15,
    width/2, -15,
    `${dimensions.width}'`
  );
  
  // Height dimension
  drawDimensionLine(
    width/2 + 15, 0,
    width/2 + 15, height,
    `${dimensions.height}'`
  );
  
  // Total height dimension
  drawDimensionLine(
    width/2 + 30, 0,
    width/2 + 30, height + roofHeight,
    `${(dimensions.height + (dimensions.width/2) * (dimensions.roofPitch/12)).toFixed(1)}'`
  );
  
  // Roof pitch
  ctx.save();
  ctx.scale(1, -1);
  ctx.font = '10px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'left';
  ctx.fillText(`${dimensions.roofPitch}:12 pitch`, 5, -(height + roofHeight/2));
  ctx.restore();
};

const drawSideElevation = (ctx: CanvasRenderingContext2D, dimensions: BuildingDimensions, features: WallFeature[]) => {
  const length = dimensions.length * scale;
  const height = dimensions.height * scale;
  const roofHeight = (dimensions.width / 2) * (dimensions.roofPitch / 12) * scale;
  
  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 0.5;
  
  // Vertical grid lines
  for (let x = -length/2; x <= length/2; x += scale) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height + roofHeight);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let y = 0; y <= height + roofHeight; y += scale) {
    ctx.beginPath();
    ctx.moveTo(-length/2, y);
    ctx.lineTo(length/2, y);
    ctx.stroke();
  }
  
  // Draw walls
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(-length/2, 0, length, height);
  
  // Draw roof
  ctx.beginPath();
  ctx.moveTo(-length/2, height);
  ctx.lineTo(-length/2, height + roofHeight);
  ctx.lineTo(length/2, height + roofHeight);
  ctx.lineTo(length/2, height);
  ctx.stroke();
  
  // Draw features
  features.filter(f => f.position.wallPosition === 'left').forEach(feature => {
    const featureWidth = feature.width * scale;
    const featureHeight = feature.height * scale;
    let x = (feature.position.alignment === 'left')
      ? -length/2 + feature.position.xOffset * scale
      : (feature.position.alignment === 'right')
        ? length/2 - (feature.position.xOffset * scale) - featureWidth
        : -featureWidth/2 + (feature.position.xOffset * scale);
    
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x, feature.position.yOffset * scale, featureWidth, featureHeight);
  });
  
  // Draw dimensions
  const drawDimensionLine = (x1: number, y1: number, x2: number, y2: number, text: string) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw arrows
    const arrowSize = 5;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // Start arrow
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize * Math.cos(angle + Math.PI/6), y1 + arrowSize * Math.sin(angle + Math.PI/6));
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize * Math.cos(angle - Math.PI/6), y1 + arrowSize * Math.sin(angle - Math.PI/6));
    ctx.stroke();
    
    // End arrow
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI/6), y2 - arrowSize * Math.sin(angle + Math.PI/6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI/6), y2 - arrowSize * Math.sin(angle - Math.PI/6));
    ctx.stroke();
    
    // Draw text
    ctx.save();
    ctx.scale(1, -1);
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textX = (x1 + x2) / 2;
    const textY = -((y1 + y2) / 2);
    ctx.fillStyle = '#000';
    ctx.fillText(text, textX, textY);
    ctx.restore();
  };
  
  // Length dimension
  drawDimensionLine(
    -length/2, -15,
    length/2, -15,
    `${dimensions.length}'`
  );
  
  // Height dimension
  drawDimensionLine(
    length/2 + 15, 0,
    length/2 + 15, height,
    `${dimensions.height}'`
  );
  
  // Total height dimension
  drawDimensionLine(
    length/2 + 30, 0,
    length/2 + 30, height + roofHeight,
    `${(dimensions.height + (dimensions.width/2) * (dimensions.roofPitch/12)).toFixed(1)}'`
  );
};

const createDrawing = (
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D) => void
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Set background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  
  // Set up coordinate system
  ctx.translate(width / 2, height / 2);
  ctx.scale(1, -1);
  
  // Draw
  drawFn(ctx);
  
  return canvas.toDataURL('image/png');
};

export const exportTechnicalDrawings = (dimensions: BuildingDimensions, features: WallFeature[]) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [800, 600]
  });

  // Set up drawing dimensions
  const drawingWidth = 250;
  const drawingHeight = 180;
  const margin = 20;
  const startY = 50;

  // Add title
  pdf.setFontSize(16);
  pdf.text('Barn Technical Drawings', 400, 30, { align: 'center' });

  // Floor Plan
  const floorPlan = createDrawing(drawingWidth, drawingHeight, (ctx) => drawFloorPlan(ctx, dimensions, features));
  pdf.addImage(floorPlan, 'PNG', margin, startY, drawingWidth, drawingHeight);
  pdf.setFontSize(12);
  pdf.text('Floor Plan', margin + drawingWidth/2, startY - 10, { align: 'center' });

  // Front Elevation
  const frontElevation = createDrawing(drawingWidth, drawingHeight, (ctx) => drawFrontElevation(ctx, dimensions, features));
  pdf.addImage(frontElevation, 'PNG', margin + drawingWidth + margin, startY, drawingWidth, drawingHeight);
  pdf.text('Front Elevation', margin + drawingWidth + margin + drawingWidth/2, startY - 10, { align: 'center' });

  // Side Elevation
  const sideElevation = createDrawing(drawingWidth, drawingHeight, (ctx) => drawSideElevation(ctx, dimensions, features));
  pdf.addImage(sideElevation, 'PNG', margin + (drawingWidth + margin) * 2, startY, drawingWidth, drawingHeight);
  pdf.text('Side Elevation', margin + (drawingWidth + margin) * 2 + drawingWidth/2, startY - 10, { align: 'center' });

  // Add dimensions table
  const tableY = startY + drawingHeight + 40;
  pdf.setFontSize(14);
  pdf.text('Building Specifications', margin, tableY);
  
  pdf.setFontSize(12);
  const specs = [
    ['Width:', `${dimensions.width} ft`],
    ['Length:', `${dimensions.length} ft`],
    ['Wall Height:', `${dimensions.height} ft`],
    ['Roof Pitch:', `${dimensions.roofPitch}:12`],
    ['Peak Height:', `${(dimensions.height + (dimensions.width/2) * (dimensions.roofPitch/12)).toFixed(1)} ft`],
    ['Floor Area:', `${dimensions.width * dimensions.length} sq ft`]
  ];

  specs.forEach((spec, i) => {
    pdf.text(spec[0], margin, tableY + 20 + (i * 20));
    pdf.text(spec[1], margin + 100, tableY + 20 + (i * 20));
  });

  // Save PDF
  pdf.save('barn-technical-drawings.pdf');
};