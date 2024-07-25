import React, { useState } from 'react';

const ComponentForm = ({ onAddComponent }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [label, setLabel] = useState('');
  const [componentType, setComponentType] = useState('button');
  const [bgColor, setBgColor] = useState('lightblue');
  const [fontSize, setFontSize] = useState('16px');
  const [customStyle, setCustomStyle] = useState('');
  const [placeholder, setPlaceholder] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onAddComponent(apiUrl, label, componentType, bgColor, fontSize, customStyle, placeholder);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Component Type:</label>
        <select
          value={componentType}
          onChange={(e) => setComponentType(e.target.value)}
        >
          <option value="button">Button</option>
          <option value="text">Text Input</option>
          <option value="file">File Input</option>
          <option value="image">Image Input</option>
          <option value="json">JSON Display</option>
          <option value="data">Data Display</option>
        </select>
      </div>
      <div>
        <label>API URL:</label>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div>
        <label>Label/Placeholder:</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="For text and button components"
        />
        <input
          type="text"
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
          placeholder="For input placeholders"
        />
      </div>
      <div>
        <label>Background Color:</label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
        />
      </div>
      <div>
        <label>Font Size:</label>
        <input
          type="text"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        />
      </div>
      <div>
        <label>Custom Style:</label>
        <input
          type="text"
          value={customStyle}
          onChange={(e) => setCustomStyle(e.target.value)}
          placeholder="e.g., margin: 10px; padding: 5px;"
        />
      </div>
      <button type="submit">Add Component</button>
    </form>
  );
};

export default ComponentForm;
