import { useState, useEffect } from 'react';
import { Button, InputGroup, Form, Modal } from 'react-bootstrap';

const ShareNotebookModal = ({ show, handleClose, onSubmit, scriptData }) => {
  const [formData, setFormData] = useState({
    shareUrl: '',
    shareOptions: [],
    ...scriptData
  });

  useEffect(() => {
    setFormData({
      shareUrl: '',
      shareOptions: [],
      ...scriptData
    });
  }, [scriptData]);

  const handleAdd = () => {
    if (isFormValid()) {
      onSubmit(formData);
      handleClose();
    } else {
      console.log('Invalid form');
    }
  };

  const handleCheckboxChange = (option) => {
    setFormData(prev => {
      const options = [...prev.shareOptions];
      if (options.includes(option)) {
        return { ...prev, shareOptions: options.filter(opt => opt !== option) };
      } else {
        return { ...prev, shareOptions: [...options, option] };
      }
    });
  };

  const isFormValid = () => {
    return formData.shareUrl !== '';
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{scriptData.scriptName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="basic-url">
            <Form.Label>Your Share URL</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">
                {`https://controlia.onrender.com/${scriptData.userId}/script/`}
              </InputGroup.Text>
              <Form.Control
                id="basic-url"
                aria-describedby="basic-addon3"
                value={formData.shareUrl}
                onChange={(e) => setFormData({ ...formData, shareUrl: e.target.value })}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="shareOptions">
            <Form.Label>Share Options</Form.Label>
            <Form.Check
              type="checkbox"
              label="Don't show code. (only a run button and output will be visible.)"
              checked={formData.shareOptions.includes('dontShowCode')}
              onChange={() => handleCheckboxChange('dontShowCode')}
            />
            <Form.Check
              type="checkbox"
              label="Auto execute when page is loaded."
              checked={formData.shareOptions.includes('autoExecute')}
              onChange={() => handleCheckboxChange('autoExecute')}
            />
            <Form.Check
              type="checkbox"
              label="Let me stay anonymous."
              checked={formData.shareOptions.includes('stayAnonymous')}
              onChange={() => handleCheckboxChange('stayAnonymous')}
            />
          </Form.Group>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAdd} disabled={!isFormValid()}>
              Create Share Link
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ShareNotebookModal;
