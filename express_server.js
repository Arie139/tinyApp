const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Welcome"); // homepage
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});// urls page

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});// new url

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
}); // new short url redirect to short url

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars); // new url
});
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls'); //update url in database
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
}); // delete short url

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL); // short url redirect to long
});

app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
})//login page

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})//logout page

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(6)
  return r;
}// rnd key generator 6 alphanumeric