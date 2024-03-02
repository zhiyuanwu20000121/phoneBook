import { useState, useEffect } from 'react'
import axios from 'axios';
import personService from './back_service/back_service';
import './index.css'

const Notification = ({ message }) => {
  if (!message) {
    return null;
  }

  const className = `notification-${message.type}`; 

  return (
    <div className={className}>
      {message.content}
    </div>
  );
}


const Person = ({ person }) => (
  <li>{person.name} {person.number}</li>
);

const Persons = ({ persons, onDelete }) => (
  <ul>
      {persons.map(person =><div key={person.id}><Person person={person} /> <button onClick={()=>onDelete(person.id)}>delete</button></div> )}
  </ul>
);

// PersonForm Component
const PersonForm = ({ newName, newNumber, onNameChange, onNumberChange, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <div>
      name: <input
        value={newName}
        onChange={onNameChange}
        placeholder="Enter name"
      />
    </div>
    <div>
      number: <input
        value={newNumber}
        onChange={onNumberChange}
        placeholder="Enter number"
      />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
);

// Filter Component
const Filter = ({ value, onChange }) => (
  <div>
    filter shown with: <input
      value={value}
      onChange={onChange}
      placeholder="Search by name..."
    />
  </div>
);

const App = () => {
  const [persons, setPersons] = useState([
    // { name: 'Arto Hellas', number: '040-123456', id: 1 },
    // { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
    // { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
    // { name: 'Mary Poppendieck', number: '39-23-6423122', id: 4 }
  ])
  const [newName, setNewName] = useState('please enter the name')
  const [newNumber, setNewNumber] = useState('please enter the number')
  const [searchGroup, setSearchGroup] = useState('')
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success', duration = 5000) => {
    setNotification({ content: message, type });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

//axios
  useEffect(() => {
    console.log('effect');
    axios
      .get('http://localhost:3001/api/persons')
      .then(response => {
        console.log('promise fulfilled');
        setPersons(response.data);
      });
  }, []);

  const addPeople = (event) => {
    event.preventDefault()
    const nameExists = persons.some(person => person.name === newName);
    console.log('button clicked', event.target)
    const personObject = {
      name: newName,
      number: newNumber,
      id:(persons.length+1).toString()
    }
    if (nameExists) {
      // if name exists will alert
      const existingPerson = persons.find(person => person.name === newName);
      const isConfirmed = window.confirm(`${newName} is already added to the phonebook, replace the old number with a new one?`);
      if (isConfirmed) {
        personService.update(existingPerson.id, { ...existingPerson, number: newNumber })
        .then(returnedPerson => {
          setPersons(persons.map(person => person.id !== existingPerson.id ? person : returnedPerson));
          setNewName('');
          setNewNumber('');
          showNotification(`Updated ${existingPerson.name}'s number`);
        })
        .catch(error => {
          alert(`The person '${existingPerson.name}' was not found on the server.`);
          setPersons(persons.filter(person => person.id !== existingPerson.id));
          showNotification(`The person '${existingPerson.name}' was not found or could not be updated.`, 'error');
        });
      }
      //alert(`${newName} is already added to phonebook`);
    } else {
      personService.create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson));
          setNewName('');
          setNewNumber('');
          console.log(personObject.name);
          showNotification(`Added ${personObject.name}`);
        });
      // console.log(personObject)
      // setPersons(persons.concat(personObject))
      // setNewName('')
      // setNewNumber('')
      // console.log(persons)
      // // save the data
      // axios.post('http://localhost:3001/persons', personObject)
      // .then(response => {
      //   setPersons(persons.concat(response.data));
      //   setNewName('');
      //   setNewNumber('');
      //   console.log('Added:', response.data);
      // })
      // .catch(error => {
      //   console.error('Error adding the person:', error);
      //   alert('Error adding the person');
      // });
    }
  }
  const handleDelete = (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this person?");
    if (isConfirmed) {
      personService.remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
          showNotification('Person deleted successfully', 'success', 3000);
        })
        .catch(error => {
          alert('There was an error deleting the person');
          console.error(error);
          showNotification('Failed to delete the person. They may have already been removed.', 'error');
        });
    }
  }
  

  const handleNameChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }
  const handleSearchGroup = (event) => {
    console.log(event.target.value)
    setSearchGroup(event.target.value)
  }

  const filteredPersons = searchGroup
    ? persons.filter(person =>
      person.name.toLowerCase().includes(searchGroup.toLowerCase())
    )
    : persons;

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} />
      <Filter value={searchGroup} onChange={handleSearchGroup} />
      {/* <div>
        filter shown with: <input
          value={searchGroup}
          onChange={handleSearchGroup}
        />
      </div> */}
      <h2>add a new</h2>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        onNameChange={handleNameChange}
        onNumberChange={handleNumberChange}
        onSubmit={addPeople}
      />
      {/* <form onSubmit={addPeople}>
        <div>
          name: <input
            value={newName}
            onChange={handleNameChange}
          />
        </div>
        <div>
          number: <input
            value={newNumber}
            onChange={handleNumberChange}
          />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form> */}
      <h2>Numbers</h2>
      {/* <ul>
        {filteredPersons.map((person) => (
          <li key={person.name}>{person.name} {person.number}</li>
        ))}
      </ul> */}
      <Persons persons={filteredPersons} onDelete={handleDelete}/>
    </div>
  )
}

export default App