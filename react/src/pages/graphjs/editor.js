// GrapesEditor.js
import React, { useEffect } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

const GrapesEditor = () => {
  useEffect(() => {
    const editor = grapesjs.init({
      container: '#editor',
      fromElement: true,
      width: 'auto',
      storageManager: false,
      blockManager: {
        appendTo: '#blocks',
        blocks: [
          {
            id: 'custom-component',
            label: 'Custom Component',
            content: '<div data-gjs-type="custom-component">Custom Component</div>',
          },
        ],
      },
    });

    // Define custom component
    editor.DomComponents.addType('custom-component', {
      model: {
        defaults: {
          tagName: 'div',
          draggable: true,
          droppable: true,
          attributes: { 'data-gjs-type': 'custom-component' },
          components: [
            {
              type: 'text',
              content: 'This is a custom component',
            },
          ],
          traits: [
            {
              type: 'text',
              label: 'API Endpoint',
              name: 'api-endpoint',
            },
          ],
        },
        init() {
          this.on('change:attributes:api-endpoint', this.fetchData);
        },
        fetchData() {
          const endpoint = this.get('attributes')['api-endpoint'];
          if (endpoint) {
            fetch(endpoint)
              .then(response => response.json())
              .then(data => {
                this.components().reset();
                this.components().add({
                  type: 'text',
                  content: JSON.stringify(data),
                });
              })
              .catch(error => {
                console.error('Error fetching data:', error);
              });
          }
        },
      },
      view: {
        onRender() {
          const endpoint = this.model.get('attributes')['api-endpoint'];
          if (endpoint) {
            this.model.fetchData();
          }
        },
      },
    });
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <div id="blocks" style={{ width: '300px', borderRight: '1px solid #ddd' }}></div>
      <div id="editor" style={{ flex: 1 }}></div>
    </div>
  );
};

export default GrapesEditor;
