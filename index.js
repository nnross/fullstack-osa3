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
    const { name, number} = req.body
    Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { new: true, runValidators: true}
        )
        .then((person) => res.json(person))
        .catch((error) => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return res.status(400).json({error: error.message})
    }
    console.error(error.message)
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })