require("dotenv-safe").config({
  allowEmptyValues: true,
});
require("./config/database");
const createError = require("http-errors");
const express = require("express");
const httpContext = require("express-http-context");
const path = require("path");
const cookieParser = require("cookie-parser");
//const validator = require("express-validator");
const expressHandleBar = require("express-handlebars");
const cors = require("cors");

const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
// const session = require("express-session");
// const MongoStore = require('connect-mongo')(session);

const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");
const helmet = require("helmet");
const uuid = require("uuid").v4;

// const SQLiteStore = require('connect-sqlite3')(session);

const i18next = require("i18next"); /// multi language
const Backend = require("i18next-fs-backend"); //used to load translation files
const i18nextMiddleware = require("i18next-http-middleware"); //Detects the user's language

// const redis = require("redis");
// const redisStore = require("connect-redis")(session);
// const client = redis.createClient();

/* Custom Files*/
const { transaction } = require("./http/middlewares/dbTransaction.middleware");

const logger = require("./config/logger");
const morgan = require("./config/morgan.config");

// Initialize cron jobs
const { initializeCronJobs } = require("./cron/index");

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: __dirname + "/resources/locales/{{lng}}/{{ns}}.json",
    },
    fallbackLng: "en",
    preload: ["en", "hi"],
  });
// i18n

/* Route Imports*/
const apiRouter = require("./routes/api.routes");
const authRouter = require("./routes/auth.routes");
/* End Route Imports*/

const app = express();

// Initialize cron jobs after database connection is established
// initializeCronJobs();

//app.use(httpContext.middleware);
app.use((req, res, next) => {
  httpContext.ns.bindEmitter(req);
  httpContext.ns.bindEmitter(res);
  const requestId = req.headers["x-request-id"] || uuid();
  httpContext.set("_reqId", requestId);
  //console.log('Request Id set is: ', httpContext.get('_reqId'));
  next();
});

const originalSend = app.response.send;
app.response.send = function sendOverWrite(body) {
  originalSend.call(this, body);
  this.__custombody__ = body;
};

// CORS configuration - Allow all origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "x-request-id",
    ],
  }),
);

// var crons = require('./crons/index');
app.use(mongoSanitize());
app.use(xss());
app.use(compression());
// app.use(helmet())
app.use(i18nextMiddleware.handle(i18next));
/// Body Parser
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// view engine setup
app.set("views", path.join(__dirname, "views"));

const hbs = expressHandleBar.create({
  extname: ".hbs",
  layoutsDir: __dirname + "/views/layouts",
  defaultLayout: "main.hbs",
  helpers: {
    Section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});

app.engine("hbs", hbs.engine);

app.set("view engine", "hbs");

// Rate Limiter
app.set("trust proxy", 1);
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // n minutes
  max: 100, // limit each IP to n requests per windowMs
});
// Rate Limiter

//  apply to all requests
// app.use(limiter);

//app.use(validator());
//app.use(morgan('dev'));
const logString = `:splitter\n\x1b[33m:method\x1b[0m \x1b[36m:url\x1b[0m :statusColor :response-time ms - length|:res[content-length] :remote-addr :body  ":referrer" responseBody=:responseBody ":user-agent \n:splitter`;
if (process.env.NODE_ENV === "development") {
  app.use(morgan(logString));
} else {
  app.use(
    morgan(logString, {
      stream: {
        write: (message) => logger.info(message.trim(), { tags: ["http"] }),
      },
    }),
  ); // For Production
}
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  }),
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, 'angular')));
//app.use(transaction);

app.post("/ingress-webhook", (req, res) => {
  // console.log(req.body);
  res.send("Ingress Webhook called");
});

app.use("/api", limiter, apiRouter);
app.use("/auth", limiter, authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//need to be deleted
const exphbs = require("express-handlebars");

// Setup Handlebars with runtime options
app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: "main", // or whatever your layout file is
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  }),
);

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

// End of middleware

module.exports = app;
