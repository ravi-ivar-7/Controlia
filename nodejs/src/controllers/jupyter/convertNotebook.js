const { exec } = require('child_process');



const convertNotebook = async (req, res) => {
  const notebook = req.body.notebook;
  const convertCommand = `jupyter nbconvert --to html --stdout <<< '${notebook}'`;

  exec(convertCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).json({ error: 'Conversion failed' });
      return;
    }
    res.send(stdout);
  });
};

module.exports = {convertNotebook}
