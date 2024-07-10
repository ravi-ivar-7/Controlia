import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

const AddScheduleScriptModal = ({ show, handleClose, onSubmit, scriptData, }) => {
  const [scheduleType, setScheduleType] = useState(''); 
  const [dateTime, setDateTime] = useState('');
  const [cronFields, setCronFields] = useState({
    second: '',
    minute: '',
    hour: '',
    dayOfMonth: '',
    month: '',
    dayOfWeek: '',
  });

  const scheduleRecurring = () => {
    const { second, minute, hour, dayOfMonth, month, dayOfWeek } = cronFields;
    const cronExpression = `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    return cronExpression;
  };

  const handleAdd = () => {
    if (scheduleType === 'fixed' && dateTime) {
      scriptData.schedule = dateTime;
      scriptData.scheduleType = 'fixed';
    } else if (scheduleType === 'recurring') {
      scriptData.schedule = scheduleRecurring();
      scriptData.scheduleType = 'recurring';
    }
    setScheduleType('')
    onSubmit(scriptData);
    handleClose();
  };

  const handleFieldChange = (field, value) => {
    setCronFields({ ...cronFields, [field]: value });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title> {scriptData.title}</Modal.Title>
        {/* <Modal.Title>Language: {scriptData.language}</Modal.Title> */}
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>On a fixed Date-Time</Form.Label>
            <Form.Control
              type="datetime-local"
              placeholder="Select date and time"
              value={dateTime}
              onChange={(e) => {
                setDateTime(e.target.value);
                setScheduleType('fixed');
              }}
              disabled={scheduleType === 'recurring'}
            />
          </Form.Group>
          <Modal.Title>OR</Modal.Title>
          <Form.Group className="mb-3" controlId="exampleForm.ControlSelect1">
            <Form.Label>A recurring schedule</Form.Label>
            <Form.Control
              type="text"
              placeholder="Second (0 - 59), use * for every Second"
              value={cronFields.second}
              onChange={(e) => {
                handleFieldChange('second', e.target.value);
                setScheduleType('recurring');
              }}
              disabled={scheduleType === 'fixed'}
            />

            <Form.Control
              type="text"
              placeholder="Minute (0 - 59), use * for every Minute"
              value={cronFields.minute}
              onChange={(e) => handleFieldChange('minute', e.target.value)}
              disabled={scheduleType === 'fixed'}
            />

            <Form.Control
              type="text"
              placeholder="Hour (0 - 23), use * for every Hour"
              value={cronFields.hour}
              onChange={(e) => handleFieldChange('hour', e.target.value)}
              disabled={scheduleType === 'fixed'}
            />

            <Form.Control
              type="text"
              placeholder="Day of Week (0 - 7, Sun 0 or 7), use * for every Day of Week"
              value={cronFields.dayOfWeek}
              onChange={(e) => handleFieldChange('dayOfWeek', e.target.value)}
              disabled={scheduleType === 'fixed'}
            />

            <Form.Control
              type="text"
              placeholder="Day of Month (1 - 31), use * for every Day of Month"
              value={cronFields.dayOfMonth}
              onChange={(e) => handleFieldChange('dayOfMonth', e.target.value)}
              disabled={scheduleType === 'fixed'}
            />

            <Form.Control
              type="text"
              placeholder="Month (1 - 12), use * for every Month"
              value={cronFields.month}
              onChange={(e) => handleFieldChange('month', e.target.value)}
              disabled={scheduleType === 'fixed'}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleAdd}>
          Add/Edit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddScheduleScriptModal;
