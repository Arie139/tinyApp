const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
}));

const {
  generateRandomString,
  getUserByEmail,
  getUrls,
  getEmail,
  urlDatabase,
  users
} = require('./views/helperAndDb');


// homepage if user redirect to urls else redirect to login
app.get("/", (req, res) => {
  if((req.session.user_id)) {
    res.redirect('/urls/new')
  } else {
    res.redirect('/login'); 
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//URL page
app.get("/urls", (req, res) => {
  if((req.session.user_id)) {
    const templateVars = { 
      urls: getUrls(req.session.user_id), 
      user_id: req.session.user_id, 
      email: users[req.session.user_id].email
    };
      return res.render("urls_index", templateVars);// if user return urls
  } else {
    return res.redirect('/login'); 
  }
});

// create new url unless not logged in
app.get("/urls/new", (req, res) => {
 if (req.session.user_id){
   const templateVars = { 
     urls: urlDatabase, 
     user_id: req.session.user_id, 
     email: getEmail(req.session.user_id)};
   return res.render("urls_new", templateVars);
  } else {
    return res.redirect('/login');
  }
});

// new short url redirect to short url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  return res.redirect(`/urls/${shortURL}`);
});

// URLS of login user
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  } else {
    const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session.user_id, 
    email: getEmail(req.session.user_id)
  };
  return res.render("urls_show", templateVars); 
  }
});

//Update URL
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect('/urls');
  }
});

// delete short url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id || req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.redirect('/login');
  } else {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL]
  if (!url || !url.longURL) {
    return res.status(400).send('Please enter a valid url')
  }
  return res.redirect(url.longURL); // new url
});

// login page
app.get('/login', (req, res) => {
  const templateVars = { 
    user_id: req.session.user_id, 
    email: getEmail(req.session.user_id) 
  };
  res.render('login', templateVars);
})

//login page user input
app.post('/login', (req, res) => {
  if (req.body.email.length === 0) {
    return res.status(400).send('Please enter a valid email');
  } else if (req.body.password.length === 0) {
    return res.status(400).send('Please enter a valid password');
  }
  let user = getUserByEmail(req.body.email, users);
  console.log(req.body.email, user);
  if(!user) {
    return res.status(400).send('User incorrect');
  }else if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(400).send('Password incorrect');
  } else {
    req.session.user_id = user.id;
    return res.redirect('/urls');
  }
})

//logout page
app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/urls');
})

// register page
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id, 
    email: getEmail(req.session.user_id)
  };
  return res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if (req.body.email === "") {
    return res.status(400).send('Please enter a valid email');
  } else if (req.body.password === "") {
    return res.status(400).send('Please enter a valid password');
  }
  
  let userId = getUserByEmail(req.body.email, users);
  //if the userId is not there
  if (!userId) {
    let genId = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[genId] = { id: genId, email: req.body.email, password: hashedPassword};
    req.session.user_id = genId;
    console.log('___', users);
    console.log(getUserByEmail(req.body.email))
    return res.redirect('/urls');
  } else if (userId) {
    return res.status(403).send('There\'s already an account associated to this email.')
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
