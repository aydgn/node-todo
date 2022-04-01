const form = document.querySelector("[form-add-todo]");
const formInput = document.querySelector("[form-add-todo] input");
const formSubmitButton = form.querySelector("[form-add-todo] button");
const template = document.querySelector("template");
const table = document.querySelector("[table]");

formInput.addEventListener("input", () => {
  if (formInput.validity.valid) {
    formSubmitButton.disabled = false;
    formSubmitButton.classList.add("-valid");
  } else {
    formSubmitButton.disabled = true;
    formSubmitButton.classList.remove("-valid");
  }
});

const deleteTodo = todo => {
  fetch(`/todo/${todo}`, {
    method: "DELETE",
  })
}

const completeTodo = (id,status) => {
  fetch(`/todo/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      completed: status
    })
  })
}

const editTodo = (id, text) => {
  fetch(`/todo/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      text: text
    })
  })
}

window.addEventListener("DOMContentLoaded", async () => {
  await fetch("/todos")
    .then(data => data.json())
    .then(res => {
      res.forEach(todo => {
        const clone = template.content.cloneNode(true);
        const row = clone.querySelector("tr");
        row.setAttribute("id", todo.id);
        row.setAttribute("completed", todo.completed);

        const id = clone.querySelector("[todo-id]");
        id.textContent = new Date(todo.id).toLocaleString("tr-TR");

        const text = clone.querySelector("[todo-text]");
        text.value = todo.text;
        text.addEventListener("blur", () => {
          console.log(todo.id, text.value);
          editTodo(todo.id, text.value);
        })

        const deleteButton = clone.querySelector("[delete-todo]");
        deleteButton.addEventListener("click", () => {
          deleteTodo(todo.id);
          row.remove();
        })

        const completeButton = clone.querySelector("[complete-todo]");
        completeButton.addEventListener("click", () => {
          completeTodo(todo.id, todo.completed);
          row.setAttribute("completed", !todo.completed);
        })

        table.appendChild(clone);
      });
    });
});
