// PaintBoard.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Text as KonvaText,
  RegularPolygon,
  Transformer,
  Image as KonvaImage,
} from 'react-konva';
import Konva from 'konva'; 
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { UndoManager } from 'yjs'; 
import './PaintBoard.css';
import {
  FaPencilAlt,
  FaEraser,
  FaSquare,
  FaCircle,
  FaPlay,
  FaTextHeight,
  FaTrashAlt,
  FaImage,
  FaUndo,
  FaRedo,
} from 'react-icons/fa';
import useImage from 'use-image';

interface Shape {
  id: string;
  type: 'line' | 'rect' | 'circle' | 'triangle' | 'text' | 'image';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  stroke?: string;
  fill?: string;
  brushWidth?: number;
  src?: string;
  selectable?: boolean;
  rotation?: number;
}


// Yjs 문서, Provider
const ydoc = new Y.Doc();
const wsProvider = new WebsocketProvider('ws://localhost:3001', 'paintboard', ydoc);
const yShapes = ydoc.getArray<Shape>('shapes');
const awareness = wsProvider.awareness;

// UndoManager로 Undo Redo 
const undoManager = new UndoManager(yShapes);

const PaintBoard: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>(yShapes.toArray());
  const [tool, setTool] = useState<'select' | 'freeDraw' | 'eraser'>('select');
  const [color, setColor] = useState<string>('#000000');
  const [brushWidth, setBrushWidth] = useState<number>(5);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [userCount, setUserCount] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 지우개 제외 색상
  const presetColors = [
    '#000000',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#888888',
    '#5F04B4',
    '#FFBF00',
    '#00FFFF',
  ];

  // Yjs, Awareness
  useEffect(() => {
    const updateShapes = () => {
      setShapes(yShapes.toArray());
    };
    yShapes.observe(updateShapes);

    const updateUserCount = () => {
      setUserCount(awareness.getStates().size);
    };
    awareness.on('change', updateUserCount);
    updateUserCount();

    return () => {
      yShapes.unobserve(updateShapes);
      awareness.off('change', updateUserCount);
    };
  }, []);


  // Transformer 업데이트 (객체 회전, 객체 크기 조절절)
  useEffect(() => {
    if (!selectedId) {
      transformerRef.current?.nodes([]);
      transformerRef.current?.getLayer()?.batchDraw();
      return;
    }
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (!stage || !transformer) return;

    const selectedNode = stage.findOne(`#${selectedId}`) as Konva.Node;
    if (selectedNode) {
      transformer.nodes([selectedNode]);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
    }
  }, [selectedId, shapes]);

  // TransformEnd -> Yjs
  const handleTransformEnd = (node: Konva.Node) => {
    const id = node.id();
    const shapeIndex = shapes.findIndex((s) => s.id === id);
    if (shapeIndex === -1) return;

    const updatedShape = { ...shapes[shapeIndex] };
    updatedShape.x = node.x();
    updatedShape.y = node.y();
    updatedShape.rotation = node.rotation();

    if (node instanceof Konva.Rect || node instanceof Konva.RegularPolygon) {
      updatedShape.width = node.width() * node.scaleX();
      updatedShape.height = node.height() * node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
    } else if (node instanceof Konva.Circle) {
      updatedShape.radius = node.radius() * node.scaleX();
      node.scaleX(1);
      node.scaleY(1);
    } else if (node instanceof Konva.Image) {
      updatedShape.width = node.width() * node.scaleX();
      updatedShape.height = node.height() * node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
    }

    yShapes.delete(shapeIndex, 1);
    yShapes.push([updatedShape]);
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (tool === 'freeDraw' || tool === 'eraser') {
      setDrawing(true);
      let currentColor = color;
      let selectable = true;
      if (tool === 'eraser') {
        currentColor = '#ffffff';
        selectable = false;
      }
      yShapes.push([
        {
          id: `${Date.now()}`,
          type: 'line',
          points: [pos.x, pos.y],
          stroke: currentColor,
          brushWidth,
          selectable,
        },
      ]);
      return;
    }

    // select
    if (tool === 'select') {
      const isTransformer = e.target.getParent()?.className === 'Transformer';
      if (isTransformer) return;

      if (e.target === stage) {
        setSelectedId(null);
        return;
      }
      const clickedId = e.target.id();
      const shape = shapes.find((s) => s.id === clickedId);
      if (shape && shape.selectable !== false) {
        setSelectedId(clickedId);
      } else {
        setSelectedId(null);
      }
    }
  };


  // 마우스 움직임임
  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!drawing) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // 마지막 라인에 points 추가
    const lastShape = shapes[shapes.length - 1];
    if (lastShape?.type === 'line') {
      lastShape.points = [...(lastShape.points || []), pos.x, pos.y];
      yShapes.delete(yShapes.length - 1, 1);
      yShapes.push([lastShape]);
    }
  };

  // S마우스업
  const handleStageMouseUp = () => {
    setDrawing(false);
    // 마우스 업 시점에서, UndoManager에게 트랙 잭션 구분 (undo, redo시 한번에 지우는 게 아니라 구분을 시키기 위해해)
    undoManager.stopCapturing();
  };

  // 새 도형 추가
  const addShape = (type: 'rect' | 'circle' | 'triangle' | 'text') => {
    const shape: Shape = {
      id: `${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      radius: 50,
      stroke: color,
      fill: color,
      brushWidth,
      selectable: true,
      rotation: 0,
    };
    if (type === 'text') {
      shape.text = '텍스트';
      shape.fill = color;
    }
    yShapes.push([shape]);
  };

  // 전체 지우기
  const clearCanvas = () => {
    yShapes.delete(0, yShapes.length);
    setSelectedId(null);
  };

  // 색상 변경 (팔레트) 클릭
  const handlePresetColorClick = (newColor: string) => {
    if (selectedId) {
      const shapeIndex = shapes.findIndex((s) => s.id === selectedId);
      if (shapeIndex !== -1) {
        const shape = { ...shapes[shapeIndex] };
        if (shape.type === 'line') {
          shape.stroke = newColor;
        } else if (shape.type === 'text') {
          shape.fill = newColor;
        } else {
          shape.fill = newColor;
          shape.stroke = newColor;
        }
        yShapes.delete(shapeIndex, 1);
        yShapes.push([shape]);
      }
    } else {
      setColor(newColor);
    }
  };

  // 이미지 업로드
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const shape: Shape = {
        id: `${Date.now()}`,
        type: 'image',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        src,
        selectable: true,
        rotation: 0,
      };
      yShapes.push([shape]);
    };
    reader.readAsDataURL(file);
  };

  // 지우개
  const handleEraserButtonClick = () => {
    if (selectedId) {
      const shapeIndex = shapes.findIndex((s) => s.id === selectedId);
      if (shapeIndex !== -1) {
        yShapes.delete(shapeIndex, 1);
        setSelectedId(null);
      }
    } else {
      setTool('eraser');
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    undoManager.undo();
  };
  const handleRedo = () => {
    undoManager.redo();
  };

  return (
    <div
      className="
        paint-board
        w-full
        flex flex-col items-center
        p-5
        bg-gray-100
        dark:bg-gray-800
        text-black
        dark:text-white
        transition-colors duration-300
        min-h-screen
      "
    >
      {/* 툴바 */}
      <div
        className="
          toolbar
          flex flex-wrap gap-2 mb-4
          bg-white
          dark:bg-gray-700
          p-3
          rounded shadow
        "
      >
        {/* Undo / Redo 버튼 */}
        <button
          onClick={handleUndo}
          title="되돌리기"
          className="text-black dark:text-black"
        >
          <FaUndo />
        </button>
        <button
          onClick={handleRedo}
          title="재실행"
          className="text-black dark:text-black"
        >
          <FaRedo />
        </button>

        <button
          onClick={clearCanvas}
          title="캔버스 지우기"
          className="text-black dark:text-black"
        >
          <FaTrashAlt />
        </button>
        <button
          onClick={() => setTool('freeDraw')}
          className={`${tool === 'freeDraw' ? 'active' : ''} text-black dark:text-black`}
          title="펜 도구"
        >
          <FaPencilAlt />
        </button>
        <button
          onClick={handleEraserButtonClick}
          className={`${tool === 'eraser' ? 'active' : ''} text-black dark:text-black`}
          title="지우개 도구"
        >
          <FaEraser />
        </button>
        <button
          onClick={() => addShape('rect')}
          title="사각형 추가"
          className="text-black dark:text-black"
        >
          <FaSquare />
        </button>
        <button
          onClick={() => addShape('circle')}
          title="원 추가"
          className="text-black dark:text-black"
        >
          <FaCircle />
        </button>
        <button
          onClick={() => addShape('triangle')}
          title="삼각형 추가"
          className="text-black dark:text-black"
        >
          <FaPlay />
        </button>
        <button
          onClick={() => addShape('text')}
          title="텍스트 추가"
          className="text-black dark:text-black"
        >
          <FaTextHeight />
        </button>
        <button
          onClick={() => setTool('select')}
          className={`${tool === 'select' ? 'active' : ''} text-black dark:text-black`}
          title="선택 도구"
        >
          선택
        </button>
        <button
          onClick={handleImageUploadClick}
          title="이미지 추가"
          className="text-black dark:text-black"
        >
          <FaImage />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>

      {/* ----- 붓 두께 ----- */}
      <div
        className="
          stroke-width-control
          flex items-center gap-2 mb-4
          bg-white
          dark:bg-gray-700
          p-3
          rounded shadow
          text-black dark:text-white
        "
      >
        <label htmlFor="brushWidth">붓 두께:</label>
        <input
          type="range"
          id="brushWidth"
          min={1}
          max={50}
          value={brushWidth}
          onChange={(e) => setBrushWidth(parseInt(e.target.value, 10))}
        />
        <span>{brushWidth}px</span>
      </div>

      {/* 색상 팔레트 */}
      <div
        className="
          color-palette
          flex items-center gap-2 mb-4
          bg-white
          dark:bg-gray-700
          p-3
          rounded shadow
        "
      >
        <div className="preset-colors flex gap-2">
          {presetColors.map((presetColor) => (
            <div
              key={presetColor}
              className={`
                color-swatch
                w-6
                h-6
                rounded
                cursor-pointer
                border-2
                border-white
                hover:scale-110
                transition-transform
                ${presetColor === color ? 'selected' : ''}
              `}
              style={{ backgroundColor: presetColor }}
              onClick={() => handlePresetColorClick(presetColor)}
              title={presetColor}
            />
          ))}
        </div>
      </div>

      {/* 접속자 수 */}
      <div className="user-count mb-4 text-black dark:text-white">
        현재 접속자: {userCount}명
      </div>

      {/*  Konva 그림판판 */}
      <div
        className="
          canvas-container
          w-[800px]
          h-[600px]
          border border-gray-400
          dark:border-gray-500
          bg-white
          dark:bg-gray-700
          rounded
          shadow
          relative
        "
      >
        <Stage
          width={800}
          height={600}
          ref={stageRef}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
        >
          <Layer>
            {shapes.map((shape, i) => {
              switch (shape.type) {
                case 'line':
                  return (
                    <Line
                      key={shape.id}
                      id={shape.id}
                      points={shape.points!}
                      stroke={shape.stroke}
                      strokeWidth={shape.brushWidth}
                      tension={0.5}
                      lineCap="round"
                      draggable={tool === 'select' && shape.selectable !== false}
                      onTransformEnd={(e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e.target)}
                      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => handleTransformEnd(e.target)}
                    />
                  );
                case 'rect':
                  return (
                    <Rect
                      key={shape.id}
                      id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      fill={shape.fill}
                      stroke={selectedId === shape.id ? 'blue' : shape.stroke}
                      strokeWidth={selectedId === shape.id ? 2 : 0}
                      draggable={tool === 'select' && shape.selectable !== false}
                      onTransformEnd={(e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e.target)}
                      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => handleTransformEnd(e.target)}
                    />
                  );
                case 'circle':
                  return (
                    <Circle
                      key={shape.id}
                      id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      radius={shape.radius}
                      fill={shape.fill}
                      stroke={selectedId === shape.id ? 'blue' : shape.stroke}
                      strokeWidth={selectedId === shape.id ? 2 : 0}
                      draggable={tool === 'select' && shape.selectable !== false}
                      onTransformEnd={(e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e.target)}
                      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => handleTransformEnd(e.target)}
                    />
                  );
                case 'triangle':
                  return (
                    <RegularPolygon
                      key={shape.id}
                      id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      sides={3}
                      radius={(shape.width || 100) / 2}
                      fill={shape.fill}
                      rotation={shape.rotation || 0}
                      stroke={selectedId === shape.id ? 'blue' : shape.stroke}
                      strokeWidth={selectedId === shape.id ? 2 : 0}
                      draggable={tool === 'select' && shape.selectable !== false}
                      onTransformEnd={(e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e.target)}
                      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => handleTransformEnd(e.target)}
                    />
                  );
                case 'text':
                  return (
                    <EditableText
                      key={shape.id}
                      shape={shape}
                      isSelected={shape.id === selectedId}
                      onChange={(newAttrs) => {
                        yShapes.delete(i, 1);
                        yShapes.push([newAttrs]);
                      }}
                      tool={tool}
                    />
                  );
                case 'image':
                  return (
                    <URLImage
                      key={shape.id}
                      shape={shape}
                      tool={tool}
                      setSelectedId={setSelectedId}
                      handleTransformEnd={handleTransformEnd}
                      selectedId={selectedId}
                    />
                  );
                default:
                  return null;
              }
            })}

            <Transformer
              ref={transformerRef}
              rotateEnabled={true}
              anchorFill="white"
              anchorStroke="black"
              anchorSize={8}
              borderStroke="red"
              borderDash={[3, 3]}
              enabledAnchors={[
                'top-left', 'top-center', 'top-right',
                'middle-left', 'middle-right',
                'bottom-left', 'bottom-center', 'bottom-right',
              ]}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default PaintBoard;

interface EditableTextProps {
  shape: Shape;
  isSelected: boolean;
  onChange: (newAttrs: Shape) => void;
  tool: 'select' | 'freeDraw' | 'eraser';
}

const EditableText: React.FC<EditableTextProps> = ({
  shape,
  isSelected,
  onChange,
  tool,
}) => {
  const textRef = useRef<Konva.Text>(null);

  useEffect(() => {
    if (!isSelected || !textRef.current) return;

    const textNode = textRef.current;

    const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = textNode.getStage();
      if (!stage) return;

      const absPos = textNode.getAbsolutePosition();
      const containerRect = stage.container().getBoundingClientRect();

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      textarea.value = textNode.text() || '';
      textarea.style.position = 'absolute';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.background = 'rgba(255,255,255,0.9)';
      textarea.style.fontSize = `${textNode.fontSize()}px`;
      textarea.style.color =
        typeof textNode.fill() === 'string' ? (textNode.fill() as string) : '#000';
      textarea.style.resize = 'none';
      textarea.style.padding = '0px';
      textarea.style.margin = '0px';
      textarea.style.zIndex = '1000';
      textarea.style.lineHeight = '1.2';
      textarea.style.whiteSpace = 'pre-wrap';

      const textWidth = shape.width || 200;
      textarea.style.width = `${textWidth}px`;

      const offsetX = containerRect.left + absPos.x;
      const offsetY = containerRect.top + absPos.y;
      textarea.style.top = '0px';
      textarea.style.left = '0px';
      textarea.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

      textarea.focus();

      let removed = false;
      const removeTextarea = () => {
        if (!removed) {
          removed = true;
          if (textarea.parentNode) {
            textarea.parentNode.removeChild(textarea);
          }
        }
      };

      const finishTextarea = () => {
        onChange({
          ...shape,
          text: textarea.value,
        });
        removeTextarea();
      };

      const handleBlur = () => finishTextarea();
      textarea.addEventListener('blur', handleBlur);
    };

    textNode.on('dblclick', handleDblClick);
    return () => {
      textNode.off('dblclick', handleDblClick);
    };
  }, [isSelected, onChange, shape]);

  return (
    <KonvaText
      ref={textRef}
      id={shape.id}
      text={shape.text}
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation || 0}
      fill={shape.fill}
      fontSize={16}
      wrap="word"
      width={shape.width || 200} 
      draggable={tool === 'select' && shape.selectable !== false}
      onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
        const node = textRef.current;
        if (!node) return;
        onChange({
          ...shape,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
        });
      }}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
        onChange({
          ...shape,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    />
  );
};


// URLImage 이미지
interface URLImageProps {
  shape: Shape;
  tool: 'select' | 'freeDraw' | 'eraser';
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  handleTransformEnd: (node: Konva.Node) => void;
  selectedId: string | null;
}

const URLImage: React.FC<URLImageProps> = ({
  shape,
  tool,
  setSelectedId,
  handleTransformEnd,
  selectedId,
}) => {
  const [image] = useImage(shape.src || '');

  return (
    <KonvaImage
      id={shape.id}
      image={image}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      rotation={shape.rotation || 0}
      stroke={selectedId === shape.id ? 'blue' : shape.stroke}
      strokeWidth={selectedId === shape.id ? 2 : 0}
      draggable={tool === 'select' && shape.selectable !== false}
      onTransformEnd={(e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e.target)}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => handleTransformEnd(e.target)}
      onClick={() => {
        if (tool === 'select' && shape.selectable !== false) {
          setSelectedId(shape.id);
        }
      }}
      onTap={() => {
        if (tool === 'select' && shape.selectable !== false) {
          setSelectedId(shape.id);
        }
      }}
    />
  );
};
