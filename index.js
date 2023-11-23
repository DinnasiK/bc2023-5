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
      return res.status(500).send('Помилка при читанні файлу з замітками.');
    }

    const notes = JSON.parse(data);

    const noteIndex = notes.findIndex(n => n.note_name === noteName);

    if (noteIndex !== -1) {
      notes[noteIndex].note_text = newNoteText;

      // Записати оновлений масив заміток назад у файл
      fs.writeFile(notesPath, JSON.stringify(notes), (err) => {
        if (err) {
          // Якщо сталася помилка при записі, відправити статус-код помилки 500
          return res.status(500).send('Помилка при оновленні замітки.');
        }
        // Якщо оновлення пройшло успішно, відправити статус-код успіху 200
        res.status(200).send('Замітка оновлена успішно.');
      });
    } else {
      // Якщо замітка з такою назвою не знайдена, відправити статус-код помилки 404
      res.status(404).send('Замітку з такою назвою не знайдено.');
    }
  });
});

app.delete('/notes/:note_name', (req, res) => {
  // Отримуємо назву замітки, яку потрібно видалити, з параметрів шляху
  const noteName = req.params.note_name;

  // Вказуємо шлях до файлу з замітками
  const notesPath = path.join(__dirname, 'notes.json');

  // Читаємо файл з замітками
  fs.readFile(notesPath, 'utf8', (err, data) => {
    if (err) {
      // Якщо сталася помилка при читанні файлу, відправляємо статус-код помилки сервера
      return res.status(500).send('Помилка при читанні файлу з замітками.');
    }

    // Розбираємо вміст файлу як JSON
    const notes = JSON.parse(data);

    // Визначаємо, чи існує замітка з такою назвою
    const noteIndex = notes.findIndex(n => n.note_name === noteName);

    if (noteIndex !== -1) {
      // Якщо замітка існує, видаляємо її з масиву
      notes.splice(noteIndex, 1);

      // Записуємо оновлений масив заміток назад у файл
      fs.writeFile(notesPath, JSON.stringify(notes), 'utf8', (err) => {
        if (err) {
          // Якщо сталася помилка при записі, відправляємо статус-код помилки сервера
          return res.status(500).send('Помилка при видаленні замітки.');
        }
        // Відправляємо відповідь, що замітка була успішно видалена
        res.status(200).send(`Замітка з назвою "${noteName}" була видалена.`);
      });
    } else {
      // Якщо замітки з такою назвою не існує, відправляємо статус-код помилки 404
      res.status(404).send('Замітку з такою назвою не знайдено.');
    }
  });
});

app.listen(8000,() => {
    console.log("Server is running on http://localhost:8000/");
});