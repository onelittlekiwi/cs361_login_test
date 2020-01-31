const express         = require('express'),
      exphbs          = require('express-handlebars'),
      cookieParser    = require('cookie-parser'),
      bodyParser      = require('body-parser'),
      crypto          = require('crypto');

const app = express();
const authTokens = {};

const users = [
    // hard code test sample
    {
        username: 'test',
        // This is the SHA256 hash for value of `password`
        password: 'XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg='
    }
];

// retrun encrypted password
const getHashedPassword = (password) => {
    const SHA256 = crypto.createHash('sha256');
    const hash = SHA256.update(password).digest('base64');
    return hash;
}

// this toke will be used to identify the user and each time they send an HTTP request
const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

app.use("/public", express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use((req, res, next) => {
    const authToken = req.cookies['AuthToken'];
    req.user = authTokens[authToken];
    next();
});

app.engine('hbs', exphbs({
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = getHashedPassword(password);

    const user = users.find( u => {
        return u.username === username && hashedPassword === u.password
    });

    if (user) {
        const authToken = generateAuthToken();
        authTokens[authToken] = username;
        res.cookie('AuthToken', authToken);
        res.redirect('/protected');
        return;
    } else {
        res.render('login', {
            message: 'Invalid username or password',
            messageClass: 'alert-danger'
        });
    }
});

app.get('/protected', (req, res) => {
    if (req.user) {
        res.render('protected');
    } else {
        res.render('login', {
            message: 'Please login to continue',
            messageClass: 'alert-danger'
        });
    }
});

app.listen(3000);