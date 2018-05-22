# stm-express-backend

Backend for simple task manager using the power of ExpressJS, jsonwebtoken and mongodb as database

Download the frontend you prefer which designed for 
You should read [stm](https://github.com/blacktoviche/stm) before start using this backend


## Installation

```bash
# Clone this repository
git clone https://github.com/blacktoviche/stm-express-backend
# Go into the repository
cd stm-express-backend
# Install dependencies
yarn install
# Run the app
yarn start
# In development mode I'm using "forever" for hot loading
yarn run dev
``` 

## Note
In case you want to use stm-web inside this backend copy everything from stm-web build folder and copy it in the main folder here
After that uncomment this in server.js

```js
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
```
In that case don't need to enable CORS anymore so in server.js you should comment this

```js
app.use(cors());
```
and remove CORS module from the app dependencies
```bash
# Remove CORS module
yarn remove cors
``` 




## License
- [MIT](LICENSE)

Twitter [@SyrianDeveloper](https://www.twitter.com/SyrianDeveloper)