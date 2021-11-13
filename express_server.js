const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const users = { 
  "95xkr9": {
    id: "95xkr9", 
    email: "user@example.com", 
    password: "123"
  },
 "2ps7g3": {
    id: "2ps7g3", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  } //user database
};
console.log(users);

function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(6)
  return r;
}// rnd key generator 6 alphanumeric

const getEmail = user_id => {
  if(users[user_id]) {
    return users[user_id].email;
  } else {
    return null;
  }
};//email from id

const getUserByEmail = email => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
};  //find email in users
 
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "95xkr9"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const getUrls = user => {
  const urls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === user) {
      urls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return urls;
};

app.get("/", (req, res) => {
  if((req.cookies['user_id'])) {
    res.redirect('/urls/new')
  } else {
    res.redirect('/login'); // homepage redirect to urls
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if((req.cookies['user_id'])) {
    const templateVars = { 
      urls: getUrls(req.cookies['user_id']), 
      user_id: req.cookies["user_id"], 
      email: users[req.cookies['user_id']].email
    };
      return res.render("urls_index", templateVars);
  } else {
    return res.redirect('/login'); // homepage redirect to urls
  }
});

app.get("/urls/new", (req, res) => {
 if (req.cookies['user_id']){
   const templateVars = { 
     urls: urlDatabase, 
     user_id: req.cookies["user_id"], 
     email: getEmail(req.cookies['user_id'])};
   return res.render("urls_new", templateVars);
  } else {
    return res.redirect('/login');
  }
});// new url

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }
  console.log(urlDatabase);
  return res.redirect(`/urls/${shortURL}`);
}); // new short url redirect to short url

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  }
    const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.cookies["user_id"], 
    email: getEmail(req.cookies['user_id'])
  };
  return res.render("urls_show", templateVars); 
});

app.post("/urls/:shortURL", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  } else if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect('/urls'); //update urls
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.cookies['user_id'] || req.cookies['user_id'] !== urlDatabase[shortURL].userID) {
    return res.redirect('/login');
  } else {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
}); // delete short url

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL]
  if (!url || !url.longURL) {
    return res.status(400).send('Please enter a valid url')
  }
  return res.redirect(url.longURL); // new url
});

app.get('/login', (req, res) => {
  const templateVars = { 
    user_id: req.cookies['user_id'], 
    email: getEmail(req.cookies['user_id']) 
  };
  res.render('login', templateVars);
})// login page

app.post('/login', (req, res) => {
  if (req.body.email.length === 0) {
    return res.status(400).send('Please enter a valid email');
  } else if (req.body.password.length === 0) {
    return res.status(400).send('Please enter a valid password');
  }
  let user = getUserByEmail(req.body.email);
  if(!user) {
    return res.status(400).send('User incorrect');
  }
  console.log(user);
  if (!bcrypt.compareSync(req.body.password, users[user.user_id].password)) {
    return res.status(400).send('Password incorrect');
  }
  res.cookie('user_id', user.user_id);
  return res.redirect('/urls');
})//login page user input

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  return res.redirect('/urls');
})//logout page

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"], 
    email: getEmail(req.cookies['user_id'])
  };
  return res.render('register', templateVars);
});// register page

app.post('/register', (req, res) => {
  if (req.body.email === "") {
    return res.status(400).send('Please enter a valid email');
  } else if (req.body.password === "") {
    return res.status(400).send('Please enter a valid password');
  }
  let userId = getUserByEmail(req.body.email);
  if (!userId) {
    genId = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[genId] = { user_id: genId, email: req.body.email, password: hashedPassword};
    console.log(users);
    res.cookie("user_id", genId);
    return res.redirect('/urls');
  } else if (userId) {
    return res.status(403).send('There\'s already an account associated to this email.')
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
