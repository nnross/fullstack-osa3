import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
const app = express()

app.use(express.json())
morgan.token('body', (request) => JSON.stringify(request.body));

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

app.use(cors())
app.use(express.static('dist'))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
]

const date = new Date();

app.get('/', (req, res) => {
    res.send('<h1>Welcome!</h1>')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    res.send(`
    <div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>
    </div>
    `)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

const generateId = () => {
    const id = Math.floor(Math.random() * 1000);
    return id
}

app.post('/api/persons', (req,res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'content missing'
        })
    }

    if (persons.find(person => person.name === body.name)){
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    persons = persons.concat(person)

    res.json(person)
})

const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })