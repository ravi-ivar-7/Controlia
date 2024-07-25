import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const DraggableComponent = ({ id, index, componentType, label, bgColor, fontSize, customStyle, placeholder }) => {
  let component;

  switch (componentType) {
    case 'button':
      component = <button style={{ backgroundColor: bgColor, fontSize, ...customStyle }}>{label}</button>;
      break;
    case 'text':
      component = <input type="text" placeholder={placeholder} style={{ backgroundColor: bgColor, fontSize, ...customStyle }} />;
      break;
    case 'file':
      component = <input type="file" style={{ backgroundColor: bgColor, fontSize, ...customStyle }} />;
      break;
    case 'image':
      component = <input type="file" accept="image/*" style={{ backgroundColor: bgColor, fontSize, ...customStyle }} />;
      break;
    case 'json':
      component = <pre style={{ backgroundColor: bgColor, fontSize, ...customStyle }}></pre>;
      break;
    case 'data':
      component = <div style={{ backgroundColor: bgColor, fontSize, ...customStyle }}></div>;
      break;
    default:
      component = null;
  }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            padding: '10px',
            margin: '5px',
            border: '1px solid gray',
            borderRadius: '5px',
            textAlign: 'center',
            ...customStyle
          }}
        >
          {component}
        </div>
      )}
    </Draggable>
  );
};

export default DraggableComponent;
