// app.js - Simple To-Do with localStorage
const TODO_KEY = 'todos-v1';

let todos = [];
let filter = 'all'; // all | active | completed

// DOM
const todoForm = document.getElementById('todo-form');
const newTodoInput = document.getElementById('new-todo');
const todoList = document.getElementById('todo-list');
const itemsLeft = document.getElementById('items-left');
const filters = document.querySelectorAll('.filter');
const clearCompletedBtn = document.getElementById('clear-completed');

function save() {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function load() {
  try {
    const raw = localStorage.getItem(TODO_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    todos = [];
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.unshift({ id: uid(), text: trimmed, completed: false });
  save();
  render();
}

function toggleTodo(id) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  save();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(x => x.id !== id);
  save();
  render();
}

function updateTodoText(id, newText) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  t.text = newText.trim() || t.text;
  save();
  render();
}

function clearCompleted() {
  todos = todos.filter(x => !x.completed);
  save();
  render();
}

function filteredTodos() {
  if (filter === 'active') return todos.filter(t => !t.completed);
  if (filter === 'completed') return todos.filter(t => t.completed);
  return todos;
}

function setFilter(newFilter) {
  filter = newFilter;
  filters.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === newFilter));
  render();
}

function render() {
  todoList.innerHTML = '';
  const list = filteredTodos();
  if (list.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'todo-item';
    empty.innerHTML = '<div class="todo-text" style="color:#9ca3af">No tasks</div>';
    todoList.appendChild(empty);
  } else {
    for (const t of list) {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = t.id;

      const chk = document.createElement('button');
      chk.className = 'todo-checkbox' + (t.completed ? ' checked' : '');
      chk.setAttribute('aria-pressed', t.completed);
      chk.title = t.completed ? 'Mark active' : 'Mark complete';
      chk.innerHTML = t.completed ? '✓' : '';
      chk.onclick = () => toggleTodo(t.id);

      const text = document.createElement('div');
      text.className = 'todo-text' + (t.completed ? ' completed' : '');
      text.textContent = t.text;
      text.ondblclick = () => startEdit(t.id, t.text);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn';
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => startEdit(t.id, t.text);

      const delBtn = document.createElement('button');
      delBtn.className = 'action-btn';
      delBtn.textContent = 'Delete';
      delBtn.onclick = () => {
        if (confirm('Delete this task?')) deleteTodo(t.id);
      };

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(chk);
      li.appendChild(text);
      li.appendChild(actions);
      todoList.appendChild(li);
    }
  }

  // items left
  const left = todos.filter(t => !t.completed).length;
  itemsLeft.textContent = `${left} item${left !== 1 ? 's' : ''} left`;
}

// Editing
function startEdit(id, currentText) {
  const li = document.querySelector(`li[data-id="${id}"]`);
  if (!li) return;
  li.innerHTML = ''; // clear
  const input = document.createElement('input');
  input.className = 'edit-input';
  input.value = currentText;
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      finishEdit(id, input.value);
    } else if (e.key === 'Escape') {
      render();
    }
  };
  input.onblur = () => finishEdit(id, input.value);
  li.appendChild(input);
  input.focus();
  // move cursor to end
  input.setSelectionRange(input.value.length, input.value.length);
}

function finishEdit(id, newText) {
  updateTodoText(id, newText);
}

// Events
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo(newTodoInput.value);
  newTodoInput.value = '';
});

clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

filters.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));

// Init
load();
render();
