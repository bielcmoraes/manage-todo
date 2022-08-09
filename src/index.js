const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user => user.username === username)) // Para cada usuario cadastrado verifica se o userName é igual ao user name passado

  if(!user){
    return response.status(404).json({error: "user not found"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  
  const {name , username} = request.body;
  
  const userExists = users.find(user => user.username === username);// Para cada usuario cadastrado verifica se o userName é igual ao user name passado

  if(userExists){
    return response.status(400).json({error: "username already exists"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [ ],
  };
  
  users.push(user);
  
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo); //Adiciona o no array dentro do usuário que foi passado no corpo da requisição

  return response.status(201).json(todo); //Retorna status 201 e o todo no corpo da resposta.
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id); //Encontra o todo correto no array

  if(!todo){
    return response.status(404).json({error: "Not found"}); //Retorna que o todo não foi encontrado
  }

  todo.title = title; //Atualiza o title
  todo.deadline = new Date(deadline); //Atualiza a deadline

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id); //Encontra o todo correto no array

  if(!todo){
    return response.status(404).json({error: "Not found"}); //Retorna que o todo não foi encontrado
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id); //Retorna o index todo correto no array

  if(todoIndex == -1){
    return response.status(404).json({error: "Not found"}); //Retorna que o todo não foi encontrado
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;