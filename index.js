const express = require("express");
const fs = require('fs');
const multer = require("multer");
const app = express();
const path = require('path');
const upload = multer({ dest: "uploads/" });

app.use(express.text());

app.get("/", (req, res) => {
  res.status(200).send('<h1 style="font-size:60px;">Перейдіть на localhost:8000/UploadForm.html</h1>');
});

app.get('/notes', (req, res) => {
  const notesPath = path.join(__dirname, 'notes.json');
  if (!fs.existsSync(notesPath)) {
    fs.writeFileSync(notesPath, '[]', 'utf8');
    res.status(200).json([]);
  } else {
    fs.readFile(notesPath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('<h1 style="font-size:60px;">Помилка при читанні файлу.</h1>');
      }
      const notes = JSON.parse(data);
      res.status(200).json(notes);
    });
  }
});

app.get('/UploadForm.html', (req, res) => {
  const formPath = path.join(__dirname, 'static', 'UploadForm.html');
  res.sendFile(formPath, (err) => {
    if (err) {
      res.status(404).send('<h1 style="font-size:60px;">Файл не знайдено.</h1>');
    }
  });
});

app.post("/upload", upload.single("note"), (req, res) => {
  const noteName = req.body.note_name;
  const noteText = req.body.note;

  if (!noteName) {
    return res.status(400).send('<h1 style="font-size:60px;">Назва нотатки не може бути пустою.</h1>');
  }

  fs.readFile("notes.json", "utf8", (err, notesData) => {
    if (err) {
      const newNote = { note_name: noteName, note_text: noteText };
      fs.writeFileSync("notes.json", JSON.stringify([newNote]));
      res.status(201).send('<h1 style="font-size:60px;">Нотатка збережена.</h1>');
    } else {
      const notes = JSON.parse(notesData);
      const existingNote = notes.find((note) => note.note_name === noteName);
      if (existingNote) {
        res.status(400).send('<h1 style="font-size:60px;">Нотатка з таким імям вже існує.</h1>');
      } else {
        notes.push({ note_name: noteName, note_text: noteText });
        fs.writeFileSync("notes.json", JSON.stringify(notes));
        res.status(201).send('<h1 style="font-size:60px;">Нотатка збережена.</h1>');
      }
    }
  });
});

app.get('/notes/:note_name', (req, res) => {
  const noteName = req.params.note_name;

  const notesPath = path.join(__dirname, 'notes.json');

  fs.readFile(notesPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('<h1 style="font-size:60px;">Помилка при читанні файлу.</h1>');
    }

    const notes = JSON.parse(data);

    const note = notes.find(n => n.note_name === noteName);

    if (note) {
      res.status(200).send(note.note_text);
    } else {
      res.status(404).send('<h1 style="font-size:60px;">Нотатки з такою назвою не знайдено.</h1>');
    }
  });
});

app.put('/notes/:note_name', (req, res) => {
  const noteName = req.params.note_name;
  const newNoteText = req.body;

  const notesPath = path.join(__dirname, 'notes.json');

  fs.readFile(notesPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('<h1 style="font-size:60px;">Помилка при читанні файлу з замітками.</h1>');
    }

    const notes = JSON.parse(data);

    const noteIndex = notes.findIndex(n => n.note_name === noteName);

    if (noteIndex !== -1) {
      notes[noteIndex].note_text = newNoteText;

      fs.writeFile(notesPath, JSON.stringify(notes), (err) => {
        if (err) {
          return res.status(500).send('<h1 style="font-size:60px;">Помилка при оновленні замітки.</h1>');
        }
        res.status(200).send('<h1 style="font-size:60px;">Замітка оновлена успішно.</h1>');
      });
    } else {
      res.status(404).send('<h1 style="font-size:60px;">Замітку з такою назвою не знайдено.</h1>');
    }
  });
});

app.delete('/notes/:note_name', (req, res) => {
  const noteName = req.params.note_name;

  const notesPath = path.join(__dirname, 'notes.json');

  fs.readFile(notesPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('<h1 style="font-size:60px;">Помилка при читанні файлу з замітками.</h1>');
    }

    const notes = JSON.parse(data);

    const noteIndex = notes.findIndex(n => n.note_name === noteName);

    if (noteIndex !== -1) {
      notes.splice(noteIndex, 1);

      fs.writeFile(notesPath, JSON.stringify(notes), 'utf8', (err) => {
        if (err) {
          return res.status(500).send('<h1 style="font-size:60px;">Помилка при видаленні замітки.</h1>');
        }
        res.status(200).send(`<h1 style="font-size:60px;">Замітка з назвою "${noteName}" була видалена.</h1>`);
      });
    } else {
      res.status(404).send('<h1 style="font-size:60px;">Замітку з такою назвою не знайдено.</h1>');
    }
  });
});

app.listen(8000,() => {
    console.log("Server is running on http://localhost:8000/");
});