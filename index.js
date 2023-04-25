const axios = require('axios');
const express = require('express');

const app = express();
const USERS_API = 'https://jsonplaceholder.typicode.com/users/';

const { createClient } = require( 'redis');

const client = createClient({
    password: '3XS3GAgRqQesfOIwcTYKVFZ2MMIOdh49',
    socket: {
        host: 'redis-11343.c232.us-east-1-2.ec2.cloud.redislabs.com',
        port: 11343
    }
});
app.get('/users', (req, res) => {

  try {
    axios.get(`${USERS_API}`).then(function (response) {
      const users = response.data;
      console.log('Users retrieved from the API');
      res.status(200).send(users);
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get('/cached-users', async(req, res) => {
  console.log('event')
  // client.on('error', err => console.log('Redis Client Error', err));

  // await client.connected();
  try {
    client.get('user', (err, data) => {
      
      if (err) {
        console.error(err);
        throw err;
      }

      if (data) {
        console.log('Users retrieved from Redis');
        res.status(200).send(JSON.parse(data));
      } else {
        axios.get(`${USERS_API}`).then(function (response) {
          const users = response.data;
          client.setex('user', 600, JSON.stringify(users));
          console.log('Users retrieved from the API');
          res.status(200).send(users);
        });
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});