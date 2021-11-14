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

const getUserByEmail = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
};  //find email in users

const getUrls = user => {
  const urls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === user) {
      urls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return urls;
};
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
module.exports = {
  generateRandomString,
  getUserByEmail,
  getUrls,
  getEmail,
  urlDatabase,
  users
}