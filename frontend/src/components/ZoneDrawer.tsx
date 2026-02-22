"use client";
import { useState, useRef, useCallback } from "react";
import { AnswerZone } from "@/hooks/useTests";

interface Props {
  imageUrl: string;
  zones: AnswerZone[];
  onChange: (zones: AnswerZone[]) => void;
}

interface DrawingState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export default function ZoneDrawer({ imageUrl, zones, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState<DrawingState | null>(null);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  const getRelativeCoords = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // якщо клікнули на існуючу зону — не починаємо нову
      if ((e.target as HTMLElement).dataset.zone) return;

      const { x, y } = getRelativeCoords(e);
      setDrawing({ startX: x, startY: y, currentX: x, currentY: y });
      setSelectedZone(null);
    },
    [getRelativeCoords],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drawing) return;
      const { x, y } = getRelativeCoords(e);
      setDrawing((prev) =>
        prev ? { ...prev, currentX: x, currentY: y } : null,
      );
    },
    [drawing, getRelativeCoords],
  );

  const handleMouseUp = useCallback(() => {
    if (!drawing) return;

    const x = Math.min(drawing.startX, drawing.currentX);
    const y = Math.min(drawing.startY, drawing.currentY);
    const width = Math.abs(drawing.currentX - drawing.startX);
    const height = Math.abs(drawing.currentY - drawing.startY);

    // ігноруємо дуже маленькі зони (випадковий клік)
    if (width > 2 && height > 2) {
      onChange([...zones, { x, y, width, height }]);
    }
    setDrawing(null);
  }, [drawing, zones, onChange]);

  const removeZone = useCallback(
    (index: number) => {
      onChange(zones.filter((_, i) => i !== index));
      setSelectedZone(null);
    },
    [zones, onChange],
  );

  // поточний прямокутник під час малювання
  const currentRect = drawing
    ? {
        x: Math.min(drawing.startX, drawing.currentX),
        y: Math.min(drawing.startY, drawing.currentY),
        width: Math.abs(drawing.currentX - drawing.startX),
        height: Math.abs(drawing.currentY - drawing.startY),
      }
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Намалюйте прямокутники на зображенні для позначення правильних зон
        </p>
        {zones.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-xs text-red-500 hover:underline"
          >
            Очистити всі ({zones.length})
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative select-none cursor-crosshair rounded overflow-hidden border"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt="Question"
          className="w-full block pointer-events-none"
          draggable={false}
        />

        {/* існуючі зони */}
        {zones.map((zone, index) => (
          <div
            key={index}
            data-zone={index}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZone(index === selectedZone ? null : index);
            }}
            style={{
              position: "absolute",
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
            }}
            className={`border-2 cursor-pointer transition-all
              ${
                selectedZone === index
                  ? "border-red-500 bg-red-500/20"
                  : "border-green-500 bg-green-500/20 hover:bg-green-500/30"
              }`}
          >
            {selectedZone === index && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeZone(index);
                }}
                className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white 
                           rounded-full text-xs flex items-center justify-center
                           hover:bg-red-600 z-10"
              >
                ✕
              </button>
            )}
            <span
              className="absolute top-0 left-0 bg-green-500 text-white 
                           text-xs px-1 leading-tight"
            >
              {index + 1}
            </span>
          </div>
        ))}

        {/* зона що малюється зараз */}
        {currentRect && currentRect.width > 1 && (
          <div
            style={{
              position: "absolute",
              left: `${currentRect.x}%`,
              top: `${currentRect.y}%`,
              width: `${currentRect.width}%`,
              height: `${currentRect.height}%`,
            }}
            className="border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
          />
        )}
      </div>

      {zones.length === 0 && (
        <p className="text-xs text-amber-600">
          ⚠️ Додайте хоча б одну зону правильної відповіді
        </p>
      )}
    </div>
  );
}
