const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

const Person = require('./models/person')
const { response } = require('express')

app.use(express.json())
morgan.token('body', (request) => JSON.stringify(request.body));

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

app.use(cors())
app.use(express.static('dist'))

const date = new Date();

app.get('/', (req, res) => {
    res.send('<h1>Welcome!</h1>')
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => res.json(persons))
})

app.get('/info', (req, res) => {
    Person.countDocuments().then((count) =>
    res.send(`
    <div>
    <p>Phonebook has info for ${count} people</p>
    <p>${date}</p>
    </div>
    `))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then((person) => 
        person ? res.json(person) : res.status(404).end())
        .catch((error) => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const name = req.body.name
    const number = req.body.number
    Person.findByIdAndUpdate(
        req.params.id,
        { name, number }
        )
        .then((person) => res.json(person))
        .catch((error) => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'fields missing'
        })
        .catch(error => next(error))
    }
    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })