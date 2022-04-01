import { readFile, writeFile } from "fs/promises";
import express from "express";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";

const port = process.env.PORT || 3000;
const app = express();

const { json, urlencoded } = express;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(morgan("dev")); // log HTTP reqs

app.post("/todo", async (req, res) => {
  if (!req.body.text) {
    res.status(400);
    throw new Error("Text required");
  }
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    completed: false,
  };
  const db = await readFile("todos.json", "utf-8", (err, data) => {
    if (err) throw err;
    return JSON.parse(data);
  });
  const todos = await JSON.parse(db); // parse json file to javascript object
  todos.push(newTodo); // add new todo to the array

  // write the new todo to the file
  await writeFile("todos.json", JSON.stringify(todos, null, "\t"), "utf-8", err => {
    if (err) throw err;
  });
  console.log("New todo added:", newTodo.id, newTodo.text);
  res.end();
});

app.get("/todos", async (req, res) => {
  const db = await readFile("todos.json", "utf-8");
  const todos = JSON.parse(db);
  res.json(todos);
});

app.put("/todo/:id", async (req, res) => {
  console.log("req.params:", req.params);
  const id = req.params.id;
  const status = req.params.completed;
  const db = await readFile("todos.json", "utf-8");
  const todos = await JSON.parse(db);
  const todo = await todos.find(todo => todo.id === parseInt(id));
  todo.completed = status;

  await writeFile("todos.json", JSON.stringify(todos, null, "\t"), "utf-8", err => {
    if (err) throw err;
  });
  console.log("✅ Todo completed:", `ID:${todo.id} Text:${todo.text} Completed:${todo.completed}`);
  res.end();
})

app.delete("/todo/:id", async (req, res) => {
  const id = req.params.id;
  const db = await readFile("todos.json", "utf-8");
  const todos = JSON.parse(db);
  const filteredTodos = todos.filter(todo => todo.id !== Number(id));

  await writeFile("todos.json", JSON.stringify(filteredTodos, null, "\t"), "utf-8", err => {
    if (err) throw err
  });
  console.log("🗑 Todo deleted:", id);
  res.end();
})


app.get("/", async (req, res) => {
  res.sendFile("./index.html", { root: __dirname });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
