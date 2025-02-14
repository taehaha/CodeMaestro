// PaintBoard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  FaSave,
} from 'react-icons/fa';
import useImage from 'use-image';
import throttle from 'lodash.throttle';

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
  eraser?: boolean;
  fontSize?: number;
}

const PaintBoard: React.FC = () => {
  // URL 쿼리에서 roomId 추출
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId') || 'paintboard';

  // Yjs 문서 생성 및 명령용 Map 생성 - clear를 위해 
  const [ydoc] = useState(() => new Y.Doc());
  const commands = ydoc.getMap("commands");

  // Yjs 문서, WebSocket Provider, 공유 배열, UndoManager 생성
  const [wsProvider] = useState(
    () => new WebsocketProvider(process.env.REACT_APP_CONCURRENCY_BACKEND_WEBSOCKET_URL as string, roomId, ydoc)
  );
  const [yShapes] = useState(() => ydoc.getArray<Shape>('shapes'));
  const awareness = wsProvider.awareness;
  const [undoManager] = useState(() => new UndoManager(yShapes));

  // 로컬 상태
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [tool, setTool] = useState<'select' | 'freeDraw' | 'eraser'>('select');
  const [color, setColor] = useState<string>('#000000');
  const [brushWidth, setBrushWidth] = useState<number>(5);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [userCount, setUserCount] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 로컬 드로잉 상태 (아직 공유되지 않은 선 - 내 그리는 포인트와 상대방 포인트가 연결되어 튐 방지지)
  const [localLine, setLocalLine] = useState<Shape | null>(null);

  // 추가: awareness 상태(커서 등) 저장
  const [awarenessStates, setAwarenessStates] = useState<Map<number, any>>(new Map());

  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // 현재 드로잉 중인 도형 id (사용자별로 독립)
  const currentShapeIdRef = useRef<string | null>(null);

  // 색상상
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

  // yShapes 및 awareness의 원격 업데이트 반영 (로컬 드로잉 상태 우선 적용)
  useEffect(() => {
    const updateShapes = () => {
      const remoteShapes = yShapes.toArray();
      // 만약 내가 드로잉 중이면 remote에서 내 도형(같은 id)을 제거하고 localLine을 덧붙임
      if (drawing && localLine) {
        const filtered = remoteShapes.filter((s) => s.id !== localLine.id);
        setShapes([...filtered, localLine]);
      } else {
        setShapes(remoteShapes);
      }
    };
    yShapes.observe(updateShapes);

    const updateUserCount = () => {
      setUserCount(awareness.getStates().size);
    };
    awareness.on('change', updateUserCount);
    updateUserCount();

    const updateAwareness = () => {
      setAwarenessStates(new Map(awareness.getStates()));
    };
    awareness.on('change', updateAwareness);
    updateAwareness();

    return () => {
      yShapes.unobserve(updateShapes);
      awareness.off('change', updateUserCount);
      awareness.off('change', updateAwareness);
    };
  }, [yShapes, awareness, drawing, localLine]);

  // 전역 clear 명령 수신: clear 명령이 들어오면 로컬 드로잉 상태도 초기화
  useEffect(() => {
    const clearHandler = (event: Y.YMapEvent<any>) => {
      if (event.keysChanged.has("clear")) {
        setLocalLine(null);
      }
    };
    commands.observe(clearHandler);
    return () => {
      commands.unobserve(clearHandler);
    };
  }, [commands]);

  // 선택된 도형에 대해 Konva Transformer 작동
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

  // 도형의 이동/회전/크기변경 등 Transform 후 업데이트 (텍스트 제외)
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
    yShapes.insert(shapeIndex, [updatedShape]);
  };
  useEffect(() => {
    const localState = awareness.getLocalState() || {};
    if (!localState.cursorColor) {
      // 원하는 색상 배열 또는 Math.random()을 사용해 생성할 수 있습니다.
      const colors = ['#e6194b', '#3cb44b', '#ffe119', '#0082c8', '#f58231', '#911eb4', '#46f0f0', '#f032e6'];
      // 클라이언트 ID 기반으로 일관된 색상을 주려면 아래처럼 해도 좋습니다.
      const randomColor = colors[awareness.clientID % colors.length];
      // 혹은 완전히 랜덤하게 하려면:
      // const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      awareness.setLocalStateField('cursorColor', randomColor);
    }
  }, [awareness]);

  // 최신 상태값을 참조하기 위한 ref 생성 (stale closure 문제 해결)
  const drawingRef = useRef(drawing);
  const localLineRef = useRef<Shape | null>(localLine);

  useEffect(() => {
    drawingRef.current = drawing;
  }, [drawing]);

  useEffect(() => {
    localLineRef.current = localLine;
  }, [localLine]);

  // 마우스 이동에 쓰로틀 적용 
  const throttledMouseMove = useRef(
    throttle((e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      awareness.setLocalStateField('cursor', pos);
      // ref를 통해 최신 상태값 
      if (!drawingRef.current || !localLineRef.current) return;
      const updatedLine: Shape = {
        ...localLineRef.current,
        points: [...(localLineRef.current.points || []), pos.x, pos.y],
      };
      setLocalLine(updatedLine);
    }, 50)
  );

  // 마우스 이벤트 핸들러
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    if (tool === 'freeDraw' || tool === 'eraser') {
      setDrawing(true);
      let currentColor = color;
      let selectable = true;
      let isEraser = false;
      if (tool === 'eraser') {
        isEraser = true;
      }
      const newShape: Shape = {
        id: `${Date.now()}_${Math.random()}`,
        type: 'line',
        points: [pos.x, pos.y],
        stroke: isEraser ? '#000000' : currentColor,
        brushWidth,
        selectable,
        eraser: isEraser,
      };
      currentShapeIdRef.current = newShape.id;
      setLocalLine(newShape);
      return;
    }
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

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    throttledMouseMove.current(e);
  };

  const handleStageMouseUp = () => {
    if (drawing && localLine) {
      yShapes.push([localLine]);
    }
    setDrawing(false);
    currentShapeIdRef.current = null;
    setLocalLine(null);
    undoManager.stopCapturing();
  };

  // 도형 추가
  const addShape = (type: 'rect' | 'circle' | 'triangle' | 'text') => {
    const shape: Shape = {
      id: `${Date.now()}_${Math.random()}`,
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
      shape.fontSize = 16;
    }
    yShapes.push([shape]);
  };

  // Clear canvas: 공유 배열과 로컬 드로잉 상태 초기화, 그리고 clear 명령 전파 - 다른 사용자도 clear 공유하기 위해 
  const clearCanvas = () => {
    yShapes.delete(0, yShapes.length);
    setSelectedId(null);
    setLocalLine(null);
    commands.set("clear", Date.now());
  };

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
        yShapes.insert(shapeIndex, [shape]);
      }
    } else {
      setColor(newColor);
    }
  };

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
        id: `${Date.now()}_${Math.random()}`,
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

  const handleUndo = () => {
    undoManager.undo();
  };
  const handleRedo = () => {
    undoManager.redo();
  };

  const handleSaveCanvas = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'my_painting.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="paint-board w-full flex flex-col items-center p-5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white transition-colors duration-300 min-h-screen">
      {/* 툴바 */}
      <div className="toolbar flex flex-wrap gap-2 mb-4 bg-white dark:bg-gray-700 p-3 rounded shadow">
        <button onClick={handleUndo} title="되돌리기" className="text-black dark:text-black">
          <FaUndo />
        </button>
        <button onClick={handleRedo} title="재실행" className="text-black dark:text-black">
          <FaRedo />
        </button>
        <button onClick={clearCanvas} title="캔버스 지우기" className="text-black dark:text-black">
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
        <button onClick={() => addShape('rect')} title="사각형 추가" className="text-black dark:text-black">
          <FaSquare />
        </button>
        <button onClick={() => addShape('circle')} title="원 추가" className="text-black dark:text-black">
          <FaCircle />
        </button>
        <button onClick={() => addShape('triangle')} title="삼각형 추가" className="text-black dark:text-black">
          <FaPlay />
        </button>
        <button onClick={() => addShape('text')} title="텍스트 추가" className="text-black dark:text-black">
          <FaTextHeight />
        </button>
        <button
          onClick={() => setTool('select')}
          className={`${tool === 'select' ? 'active' : ''} text-black dark:text-black`}
          title="선택 도구"
        >
          선택
        </button>
        <button onClick={handleImageUploadClick} title="이미지 추가" className="text-black dark:text-black">
          <FaImage />
        </button>
        <button onClick={handleSaveCanvas} title="그림 저장" className="text-black dark:text-black">
          <FaSave />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>

      {/* 붓 두께 조절 */}
      <div className="stroke-width-control flex items-center gap-2 mb-4 bg-white dark:bg-gray-700 p-3 rounded shadow text-black dark:text-white">
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
      <div className="color-palette flex items-center gap-2 mb-4 bg-white dark:bg-gray-700 p-3 rounded shadow">
        <div className="preset-colors flex gap-2">
          {presetColors.map((presetColor) => (
            <div
              key={presetColor}
              className={`color-swatch w-6 h-6 rounded cursor-pointer border-2 border-white hover:scale-110 transition-transform ${presetColor === color ? 'selected' : ''
                }`}
              style={{ backgroundColor: presetColor }}
              onClick={() => handlePresetColorClick(presetColor)}
              title={presetColor}
            />
          ))}
        </div>
      </div>

      {/* Konva 캔버스 */}
      <div className="canvas-container w-[800px] h-[600px] border border-gray-400 dark:border-gray-500 rounded shadow relative" style={{ background: 'transparent' }}>
        <Stage
          width={800}
          height={600}
          ref={stageRef}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
        >
          <Layer>
            {shapes.map((shape) => {
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
                      globalCompositeOperation={shape.eraser ? 'destination-out' : 'source-over'}
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
                      rotation={shape.rotation || 0}
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
                        const shapeIndex = shapes.findIndex((s) => s.id === shape.id);
                        if (shapeIndex !== -1) {
                          yShapes.delete(shapeIndex, 1);
                          yShapes.insert(shapeIndex, [newAttrs]);
                        }
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
            {/* 로컬 드로잉 중인 선 렌더링 - 내 드로잉 지점과 상대 지점이 연결되어 선분이 튀는 이유를 없애기 위해 */}
            {localLine && (
              <Line
                key={localLine.id}
                id={localLine.id}
                points={localLine.points!}
                stroke={localLine.stroke}
                strokeWidth={localLine.brushWidth}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={localLine.eraser ? 'destination-out' : 'source-over'}
              />
            )}
            <Transformer
              ref={transformerRef}
              rotateEnabled={true}
              anchorFill="white"
              anchorStroke="black"
              anchorSize={8}
              borderStroke="red"
              borderDash={[3, 3]}
              enabledAnchors={[
                'top-left',
                'top-center',
                'top-right',
                'middle-left',
                'middle-right',
                'bottom-left',
                'bottom-center',
                'bottom-right',
              ]}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
          <Layer>
            {Array.from(awarenessStates.entries()).map(([clientId, state]) => {
              if (clientId === awareness.clientID) return null;
              if (!state.cursor) return null;
              return (
                <Circle
                  key={clientId}
                  x={state.cursor.x}
                  y={state.cursor.y}
                  radius={5}
                  fill={state.cursorColor || 'red'}
                  listening={false} // 이벤트를 무시하여 도형에 영향이 없도록 함
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default PaintBoard;

// EditableText (텍스트 도형에서 더블클릭 시 편집, 변환 후 fontSize, rotation 등이 업데이트됨)
interface EditableTextProps {
  shape: Shape;
  isSelected: boolean;
  onChange: (newAttrs: Shape) => void;
  tool: 'select' | 'freeDraw' | 'eraser';
}

const EditableText: React.FC<EditableTextProps> = ({ shape, isSelected, onChange, tool }) => {
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
      textarea.style.color = typeof textNode.fill() === 'string' ? (textNode.fill() as string) : '#000';
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
      fontSize={shape.fontSize || 16}
      wrap="word"
      width={shape.width || 200}
      draggable={tool === 'select' && shape.selectable !== false}
      onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
        const node = textRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const newFontSize = node.fontSize() * scaleX;
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          ...shape,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          fontSize: newFontSize,
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
