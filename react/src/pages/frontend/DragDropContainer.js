import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import DraggableComponent from './DraggableComponent';
import ComponentForm from './ComponentForm';

const DragDropContainer = () => {
  const [items, setItems] = useState([]);
  const [generatedHtml, setGeneratedHtml] = useState('');

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(items);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    setItems(reorderedItems);
  };

  const handleAddComponent = (apiUrl, label, componentType, bgColor, fontSize, customStyle, placeholder) => {
    setItems([
      ...items,
      { id: `${Date.now()}`, apiUrl, label, componentType, bgColor, fontSize, customStyle, placeholder }
    ]);
  };

  const generateHtml = () => {
    const code = items.map(item => {
      let componentHtml = '';

      switch (item.componentType) {
        case 'button':
          componentHtml = `
            <button onclick="handleClick('${item.apiUrl}')" style="background-color: ${item.bgColor}; font-size: ${item.fontSize}; ${item.customStyle}">${item.label}</button>
          `;
          break;
        case 'text':
          componentHtml = `
            <input type="text" placeholder="${item.placeholder}" style="background-color: ${item.bgColor}; font-size: ${item.fontSize}; ${item.customStyle}" />
          `;
          break;
        case 'file':
          componentHtml = `
            <input type="file" style="background-color: ${item.bgColor}; font-size: ${item.fontSize}; ${item.customStyle}" />
          `;
          break;
        case 'image':
          componentHtml = `
            <input type="file" accept="image/*" style="background-color: ${item.bgColor}; font-size: ${item.fontSize}; ${item.customStyle}" />
          `;
          break;
        case 'json':
          componentHtml = `
            <pre id="${item.id}" style="background-color: ${item.bgColor}; font-size: ${item.fontSize}; ${item.customStyle}"></pre>
            <script>
              fetch('${item.apiUrl}')
                .then(response => response.json())
                .then(data => {
                  document.getElementById('${item.id}').textContent = JSON.stringify(data, null, 2);
                });
            </script>
          `;
          break;
        case 'data':
          componentHtml = `
            <div id="${item.id}" style="background-color: ${item.bgColor}; font-size: ${item.fontSize}; ${item.customStyle}"></div>
            <script>
              fetch('${item.apiUrl}')
                .then(response => response.json())
                .then(data => {
                  const container = document.getElementById('${item.id}');
                  // Display data in a table or chart format
                  const table = document.createElement('table');
                  const thead = document.createElement('thead');
                  const tbody = document.createElement('tbody');
                  
                  // Generate table headers
                  const headers = Object.keys(data[0] || {});
                  const headerRow = document.createElement('tr');
                  headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                  });
                  thead.appendChild(headerRow);

                  // Generate table rows
                  data.forEach(row => {
                    const tr = document.createElement('tr');
                    headers.forEach(header => {
                      const td = document.createElement('td');
                      td.textContent = row[header];
                      tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                  });

                  table.appendChild(thead);
                  table.appendChild(tbody);
                  container.appendChild(table);
                });
            </script>
          `;
          break;
        default:
          componentHtml = '';
      }

      return `
        <div class="draggable" draggable="true" data-id="${item.id}" style="background-color: ${item.bgColor}; font-size: ${item.fontSize}; ${item.customStyle}">
          ${componentHtml}
        </div>
      `;
    }).join('\n');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <style>
    .draggable {
      padding: 10px;
      margin: 5px;
      border: 1px solid gray;
      border-radius: 5px;
      text-align: center;
      user-select: none;
    }
    .droppable {
      padding: 20px;
      background-color: #f0f0f0;
      min-height: 400px;
    }
  </style>
</head>
<body>
  <div class="droppable">
    ${code}
  </div>
  <script>
    function handleClick(apiUrl) {
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          console.log('API Response:', data);
          alert('API call successful! Check the console for data.');
        })
        .catch(error => {
          console.error('Error:', error);
          alert('API call failed.');
        });
    }
  </script>
</body>
</html>
    `;

    setGeneratedHtml(html);
  };

  return (
    <div>
      <h2>Drag-and-Drop API Components</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '400px' }}
            >
              {items.map((item, index) => (
                <DraggableComponent
                  key={item.id}
                  id={item.id}
                  index={index}
                  componentType={item.componentType}
                  label={item.label}
                  bgColor={item.bgColor}
                  fontSize={item.fontSize}
                  customStyle={item.customStyle}
                  placeholder={item.placeholder}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <ComponentForm onAddComponent={handleAddComponent} />
      <button onClick={generateHtml}>Generate HTML</button>
      <textarea
        value={generatedHtml}
        readOnly
        style={{ width: '100%', height: '400px', marginTop: '20px' }}
      />
    </div>
  );
};

export default DragDropContainer;
