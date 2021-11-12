const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  } //user database
};
function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(6)
  return r;
}// rnd key generator 6 alphanumeric

const getEmail = user_id => {
  return (users[user_id]) ? users[user_id].email : null;
};//email from id

const findEmail = email => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
};  //find email in users

const findPass = (userId, password) => {
  if (users[userId].password === password) {
    return true;
  }
  return false;
};// find password match in users

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect('/login'); // homepage redirect to urls
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user_id: req.cookies["user_id"], 
    email: getEmail(req.cookies['user_id'])};
  res.render("urls_index", templateVars);
});// urls page

app.get("/urls/new", (req, res) => {
 const templateVars = { 
    urls: urlDatabase, 
    user_id: req.cookies["user_id"], 
    email: getEmail(req.cookies['user_id'])};
  res.render("urls_new", templateVars);
});// new url

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
}); // new short url redirect to short url

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies["user_id"], 
    email: getEmail(req.cookies['user_id'])};
  res.render("urls_show", templateVars); 
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls'); //update urls
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
}); // delete short url

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (longURL === undefined) {
    res.status(400).send('Please enter a valid url')
  }
  const templateVars = { 
    user_id: req.cookies["user_id"], 
    email: getEmail(req.cookies['user_id'])};
  res.redirect(longURL); // new url
});

app.get('/login', (req, res) => {
  const templateVars = { 
    user_id: req.cookies['user_id'], 
    email: getEmail(req.cookies['user_id']) };
  res.render('login', templateVars);
})// login page

app.post('/login', (req, res) => {
  if (req.body.email.length === 0) {
    return res.status(400).send('Please enter a valid email');
  } else if (req.body.password.length === 0) {
    return res.status(400).send('Please enter a valid password');
  }
  let foundId = findEmail(req.body.email);
  if (!foundId) {
    return res.redirect('/register')
  } else if (!findPass(foundId, req.body.password)) {
    return res.status(400).send('Password incorrect.');
  }
  res.cookie('user_id', foundId);
  res.redirect('/urls');
})//login page user input

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
})//logout page

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"], 
    email: getEmail(req.cookies['user_id'])
  };
  res.render('register', templateVars);
});// register page

app.post('/register', (req, res) => {
  if (req.body.email === "") {
    return res.status(400).send('Please enter a valid email');
  } else if (req.body.password === "") {
    return res.status(400).send('Please enter a valid password');
  }
  let userId = findEmail(req.body.email);
  if (!userId) {
    genId = generateRandomString();
    users[genId] = { user_id: genId, email: req.body.email, password: req.body.password }
    res.cookie("user_id", genId);
  } else if (userId) {
    return res.status(403).send('There\'s already an account associated to this email.')
  }
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
